import { processTestimonialSubmission } from "../utils/testimonialSubmission";

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event);
  if (!parts) {
    setResponseStatus(event, 400);
    return { message: "Please send a valid testimonial form." };
  }

  const form = new FormData();
  for (const part of parts) {
    if (!part.name) continue;
    if (part.filename) {
      form.append(
        part.name,
        new Blob([new Uint8Array(part.data)], {
          type: part.type || "application/octet-stream",
        }),
        part.filename,
      );
    } else {
      form.append(part.name, part.data.toString("utf8"));
    }
  }

  const result = await processTestimonialSubmission(
    form,
    getHeader(event, "origin") ?? null,
    {
      NUXT_PUBLIC_SANITY_PROJECT_ID:
        process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
      NUXT_PUBLIC_SANITY_DATASET: process.env.NUXT_PUBLIC_SANITY_DATASET,
      SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
    },
  );
  setResponseStatus(event, result.status);
  return result.body;
});
