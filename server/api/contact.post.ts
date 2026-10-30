import { processContactSubmission } from "../utils/contactSubmission";

export default defineEventHandler(async (event) => {
  try {
    const result = await processContactSubmission(
      await readBody(event),
      getHeader(event, "origin") ?? null,
      {
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
        CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        RESEND_FROM_NAME: process.env.RESEND_FROM_NAME,
      },
    );
    setResponseStatus(event, result.status);
    return result.body;
  } catch (error) {
    console.error("Contact form failed:", error);
    setResponseStatus(event, 502);
    return {
      message: "Your message could not be sent. Please try again.",
    };
  }
});
