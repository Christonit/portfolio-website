import {
  envFromRequest,
  processTestimonialSubmission,
  resolveTestimonialEnvironment,
} from "../utils/testimonialSubmission";

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

  const config = useRuntimeConfig(event);
  const sanity = config.public.sanity;
  const result = await processTestimonialSubmission(
    form,
    getHeader(event, "origin") ?? null,
    resolveTestimonialEnvironment(
      {
        NUXT_PUBLIC_SANITY_PROJECT_ID: sanity?.projectId,
        NUXT_PUBLIC_SANITY_DATASET: sanity?.dataset,
        SANITY_API_WRITE_TOKEN: config.sanityApiWriteToken,
      },
      envFromRequest(event),
    ),
  );
  setResponseStatus(event, result.status);
  return result.body;
});
