import { processTestimonialSubmission } from "../../server/utils/testimonialSubmission";

export default async function testimonials(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { message: "Please send a valid testimonial form." },
      { status: 400 },
    );
  }

  const result = await processTestimonialSubmission(
    form,
    request.headers.get("origin"),
    {
      NUXT_PUBLIC_SANITY_PROJECT_ID:
        process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
      NUXT_PUBLIC_SANITY_DATASET: process.env.NUXT_PUBLIC_SANITY_DATASET,
      SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
    },
  );
  return Response.json(result.body, { status: result.status });
}

export const config = {
  path: "/api/testimonials",
  method: "POST",
  rateLimit: {
    windowLimit: 3,
    windowSize: 300,
    aggregateBy: ["ip", "domain"],
  },
};
