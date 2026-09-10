import { processContactSubmission } from "../../server/utils/contactSubmission";

export default async function contact(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { message: "Please send a valid contact request." },
      { status: 400 },
    );
  }

  try {
    const result = await processContactSubmission(
      payload,
      request.headers.get("origin"),
      {
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
        CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        RESEND_FROM_NAME: process.env.RESEND_FROM_NAME,
      },
    );
    return Response.json(result.body, { status: result.status });
  } catch (error) {
    console.error("Contact form failed:", error);
    return Response.json(
      { message: "Your message could not be sent. Please try again." },
      { status: 502 },
    );
  }
}

export const config = {
  path: "/api/contact",
  method: "POST",
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
