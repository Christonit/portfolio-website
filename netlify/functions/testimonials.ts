import {
  processTestimonialSubmission,
  resolveTestimonialEnvironment,
} from "../../server/utils/testimonialSubmission";

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
    resolveTestimonialEnvironment({}, process.env),
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
