type TestimonialEnvironment = {
  NUXT_PUBLIC_SANITY_PROJECT_ID?: string;
  NUXT_PUBLIC_SANITY_DATASET?: string;
  SANITY_API_WRITE_TOKEN?: string;
};

type TestimonialResult = {
  status: number;
  body: { message: string };
};

type ImageInfo = {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
  width: number;
  height: number;
};

const API_VERSION = "2026-09-09";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MIN_IMAGE_EDGE = 256;
const MAX_IMAGE_EDGE = 2000;
const SUCCESS_MESSAGE =
  "Thanks — your testimonial was received and will appear after review.";

function text(form: FormData, key: string, maxLength: number) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
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

function jpegDimensions(bytes: Uint8Array) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2 || offset + length + 2 > bytes.length) return null;

    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      return {
        width: (bytes[offset + 7] << 8) | bytes[offset + 8],
        height: (bytes[offset + 5] << 8) | bytes[offset + 6],
      };
    }
    offset += length + 2;
  }
  return null;
}

function webpDimensions(bytes: Uint8Array) {
  const chunk = String.fromCharCode(...bytes.slice(12, 16));
  if (chunk === "VP8X" && bytes.length >= 30) {
    return {
      width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16),
      height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16),
    };
  }
  if (chunk === "VP8 " && bytes.length >= 30) {
    return {
      width: (bytes[26] | (bytes[27] << 8)) & 0x3fff,
      height: (bytes[28] | (bytes[29] << 8)) & 0x3fff,
    };
  }
  if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    return {
      width: 1 + bytes[21] + ((bytes[22] & 0x3f) << 8),
      height:
        1 +
        (bytes[22] >> 6) +
        (bytes[23] << 2) +
        ((bytes[24] & 0x0f) << 10),
    };
  }
  return null;
}

export function inspectImage(bytes: Uint8Array): ImageInfo | null {
  const png =
    bytes.length >= 24 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every(
      (value, index) => bytes[index] === value,
    );
  if (png) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return {
      contentType: "image/png",
      extension: "png",
      width: view.getUint32(16),
      height: view.getUint32(20),
    };
  }

  const jpeg = jpegDimensions(bytes);
  if (jpeg) {
    return {
      contentType: "image/jpeg",
      extension: "jpg",
      ...jpeg,
    };
  }

  const isWebp =
    bytes.length >= 30 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  const webp = isWebp ? webpDimensions(bytes) : null;
  if (webp) {
    return {
      contentType: "image/webp",
      extension: "webp",
      ...webp,
    };
  }
  return null;
}

async function sanityRequest(
  url: string,
  token: string,
  init: RequestInit,
  fetcher: typeof fetch,
) {
  const response = await fetcher(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Sanity returned ${response.status}: ${await response.text()}`,
    );
  }
  return response;
}

export async function processTestimonialSubmission(
  form: FormData,
  origin: string | null,
  environment: TestimonialEnvironment,
  fetcher: typeof fetch = fetch,
): Promise<TestimonialResult> {
  if (!originIsAllowed(origin)) {
    return { status: 403, body: { message: "Request origin not allowed." } };
  }

  if (text(form, "company", 100)) {
    return { status: 200, body: { message: SUCCESS_MESSAGE } };
  }

  const name = text(form, "name", 80);
  const quote = text(form, "quote", 600);
  const role = text(form, "role", 120);
  const linkedinUrl = text(form, "linkedin", 300);
  const websiteUrl = text(form, "website", 300);
  const photo = form.get("photo");

  if (
    !name ||
    name.length > 80 ||
    !quote ||
    quote.length > 600 ||
    role.length > 120 ||
    linkedinUrl.length > 300 ||
    !validUrl(linkedinUrl, /(^|\.)linkedin\.com$/i) ||
    websiteUrl.length > 300 ||
    (websiteUrl && !validUrl(websiteUrl)) ||
    !(photo instanceof Blob)
  ) {
    return {
      status: 400,
      body: { message: "Please check the required fields and try again." },
    };
  }

  if (photo.size === 0 || photo.size > MAX_IMAGE_BYTES) {
    return {
      status: 400,
      body: { message: "Choose a JPG, PNG, or WebP image under 2 MB." },
    };
  }

  const bytes = new Uint8Array(await photo.arrayBuffer());
  const image = inspectImage(bytes);
  if (!image) {
    return {
      status: 400,
      body: { message: "The selected file is not a valid JPG, PNG, or WebP image." },
    };
  }
  if (
    Math.min(image.width, image.height) < MIN_IMAGE_EDGE ||
    Math.max(image.width, image.height) > MAX_IMAGE_EDGE
  ) {
    return {
      status: 400,
      body: {
        message: `Use an image between ${MIN_IMAGE_EDGE}px and ${MAX_IMAGE_EDGE}px per side.`,
      },
    };
  }

  const projectId = environment.NUXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = environment.NUXT_PUBLIC_SANITY_DATASET;
  const token = environment.SANITY_API_WRITE_TOKEN;
  if (!projectId || !dataset || !token) {
    console.error("Testimonial form: Sanity write configuration is missing.");
    return {
      status: 503,
      body: { message: "Testimonials are temporarily unavailable. Please try again." },
    };
  }

  const base = `https://${projectId}.api.sanity.io/v${API_VERSION}`;
  let assetId: string | undefined;

  try {
    const assetResponse = await sanityRequest(
      `${base}/assets/images/${encodeURIComponent(dataset)}?filename=testimonial-${Date.now()}.${image.extension}`,
      token,
      {
        method: "POST",
        headers: { "Content-Type": image.contentType },
        body: bytes,
      },
      fetcher,
    );
    const asset = (await assetResponse.json()) as { document?: { _id?: string } };
    assetId = asset.document?._id;
    if (!assetId) throw new Error("Sanity did not return an image asset id.");

    const draftId = `drafts.${crypto.randomUUID()}`;
    await sanityRequest(
      `${base}/data/mutate/${encodeURIComponent(dataset)}`,
      token,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mutations: [
            {
              create: {
                _id: draftId,
                _type: "testimonial",
                name,
                quote,
                ...(role ? { role } : {}),
                linkedinUrl,
                ...(websiteUrl ? { websiteUrl } : {}),
                photo: {
                  _type: "image",
                  asset: { _type: "reference", _ref: assetId },
                  alt: `${name} portrait`,
                },
              },
            },
          ],
        }),
      },
      fetcher,
    );
  } catch (error) {
    console.error("Testimonial submission failed:", error);
    if (assetId) {
      await fetcher(`${base}/data/mutate/${encodeURIComponent(dataset)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mutations: [{ delete: { id: assetId } }] }),
      }).catch(() => undefined);
    }
    return {
      status: 502,
      body: { message: "Your testimonial could not be saved. Please try again." },
    };
  }

  return { status: 200, body: { message: SUCCESS_MESSAGE } };
}
