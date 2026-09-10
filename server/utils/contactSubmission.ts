type ContactEnvironment = {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_FROM_NAME?: string;
};

/**
 * chsantana.com receives through Cloudflare Email Routing, which forwards
 * rather than stores. A message whose sender and recipient are the same
 * address is dropped by that forwarder instead of being delivered, so the
 * envelope sender must stay distinct from the inbox we deliver to.
 */
const DEFAULT_FROM_EMAIL = "noreply@chsantana.com";
const DEFAULT_FROM_NAME = "chsantana.com";
const DEFAULT_TO_EMAIL = "hello@chsantana.com";

function senderAddress(environment: ContactEnvironment) {
  const configured = environment.CONTACT_FROM_EMAIL?.trim();
  if (configured) return configured;

  const address = environment.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;
  const name = environment.RESEND_FROM_NAME?.trim() || DEFAULT_FROM_NAME;
  return `${name} <${address}>`;
}

type ContactResult = {
  status: number;
  body: { message: string };
};

type ContactSubmission = {
  name: string;
  email: string;
  linkedin: string;
  website: string;
  description: string;
  company: string;
};

const LIMITS = {
  name: 80,
  email: 254,
  linkedin: 300,
  website: 300,
  description: 1500,
  company: 100,
} as const;

function value(
  payload: Record<string, unknown>,
  key: keyof ContactSubmission,
) {
  const candidate = payload[key];
  return typeof candidate === "string"
    ? candidate.trim().slice(0, LIMITS[key] + 1)
    : "";
}

function validUrl(raw: string, hostname?: RegExp) {
  try {
    const url = new URL(raw);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      (!hostname || hostname.test(url.hostname))
    );
  } catch {
    return false;
  }
}

function parseSubmission(payload: unknown): ContactSubmission | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const submission: ContactSubmission = {
    name: value(record, "name"),
    email: value(record, "email"),
    linkedin: value(record, "linkedin"),
    website: value(record, "website"),
    description: value(record, "description"),
    company: value(record, "company"),
  };

  const isWithinLimits = (
    Object.keys(LIMITS) as (keyof ContactSubmission)[]
  ).every((key) => submission[key].length <= LIMITS[key]);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email);
  const validLinkedIn = validUrl(
    submission.linkedin,
    /(^|\.)linkedin\.com$/i,
  );

  if (
    !isWithinLimits ||
    !submission.name ||
    !validEmail ||
    !validLinkedIn ||
    !submission.description ||
    (submission.website && !validUrl(submission.website))
  ) {
    return null;
  }

  return submission;
}

function escapeHtml(input: string) {
  return input.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

function originIsAllowed(origin: string | null) {
  if (!origin) return false;
  try {
    const { hostname, protocol } = new URL(origin);
    return (
      (protocol === "https:" &&
        (hostname === "chsantana.com" ||
          hostname === "www.chsantana.com" ||
          hostname.endsWith(".netlify.app"))) ||
      (protocol === "http:" &&
        (hostname === "localhost" || hostname === "127.0.0.1"))
    );
  } catch {
    return false;
  }
}

export async function processContactSubmission(
  payload: unknown,
  origin: string | null,
  environment: ContactEnvironment,
  fetcher: typeof fetch = fetch,
): Promise<ContactResult> {
  if (!originIsAllowed(origin)) {
    return { status: 403, body: { message: "Request origin not allowed." } };
  }

  const submission = parseSubmission(payload);
  if (!submission) {
    return {
      status: 400,
      body: { message: "Please check the required fields and try again." },
    };
  }

  // A filled honeypot gets a success response but never reaches Resend.
  if (submission.company) {
    return {
      status: 200,
      body: { message: "Message sent. I’ll get back to you soon." },
    };
  }

  if (!environment.RESEND_API_KEY) {
    console.error("Contact form: RESEND_API_KEY is not configured.");
    return {
      status: 503,
      body: { message: "Email is temporarily unavailable. Please try again." },
    };
  }

  const name = escapeHtml(submission.name);
  const email = escapeHtml(submission.email);
  const linkedin = escapeHtml(submission.linkedin);
  const website = escapeHtml(submission.website);
  const description = escapeHtml(submission.description).replace(
    /\r?\n/g,
    "<br>",
  );

  const recipient = environment.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO_EMAIL;
  const sender = senderAddress(environment);

  if (sender.includes(recipient)) {
    console.error(
      `Contact form: sender and recipient are both ${recipient}; ` +
        "Cloudflare Email Routing drops self-addressed mail. " +
        "Set CONTACT_FROM_EMAIL or RESEND_FROM_EMAIL to a different address.",
    );
    return {
      status: 500,
      body: { message: "Email is misconfigured. Please use the direct link." },
    };
  }

  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${environment.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      reply_to: submission.email,
      subject: `Portfolio inquiry from ${submission.name.replace(/[\r\n]+/g, " ")}`,
      text: [
        `Name: ${submission.name}`,
        `Email: ${submission.email}`,
        `LinkedIn: ${submission.linkedin}`,
        `Website: ${submission.website || "Not provided"}`,
        "",
        submission.description,
      ].join("\n"),
      html: `
        <h2>New portfolio inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>LinkedIn:</strong> <a href="${linkedin}">${linkedin}</a></p>
        <p><strong>Website:</strong> ${
          website ? `<a href="${website}">${website}</a>` : "Not provided"
        }</p>
        <hr>
        <p>${description}</p>
      `,
    }),
  });

  if (!response.ok) {
    console.error(
      `Contact form: Resend returned ${response.status}.`,
      await response.text(),
    );
    return {
      status: 502,
      body: { message: "Your message could not be sent. Please try again." },
    };
  }

  // The Resend id is the only handle for tracing a message that was accepted
  // but never landed, which is exactly the failure this endpoint had.
  const accepted = (await response.json().catch(() => null)) as {
    id?: string;
  } | null;
  console.info(
    `Contact form: Resend accepted ${accepted?.id ?? "message"} for ${recipient}.`,
  );

  return {
    status: 200,
    body: { message: "Message sent. I’ll get back to you soon." },
  };
}
