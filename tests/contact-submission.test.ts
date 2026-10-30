import assert from "node:assert/strict";
import test from "node:test";
import { processContactSubmission } from "../server/utils/contactSubmission.ts";

const validSubmission = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  linkedin: "https://www.linkedin.com/in/ada-lovelace",
  website: "https://example.com",
  description: "I’m building a real-time publishing system.",
  company: "",
};

test("contact submissions are sent to the fixed recipient with reply-to", async () => {
  let requestBody: Record<string, unknown> | undefined;
  const fetcher: typeof fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({ id: "email-id" }), { status: 200 });
  };

  const result = await processContactSubmission(
    validSubmission,
    "https://chsantana.com",
    {
      RESEND_API_KEY: "re_test",
      CONTACT_TO_EMAIL: "hello@chsantana.com",
    },
    fetcher,
  );

  assert.equal(result.status, 200);
  assert.deepEqual(requestBody?.to, ["hello@chsantana.com"]);
  assert.equal(requestBody?.reply_to, "ada@example.com");
  // Cloudflare Email Routing forwards rather than stores, and drops a message
  // addressed to the address it was sent from.
  assert.ok(!String(requestBody?.from).includes("hello@chsantana.com"));
});

test("a sender matching the recipient is refused instead of silently dropped", async () => {
  let called = false;
  const fetcher: typeof fetch = async () => {
    called = true;
    return new Response(JSON.stringify({ id: "email-id" }), { status: 200 });
  };

  const result = await processContactSubmission(
    validSubmission,
    "https://chsantana.com",
    {
      RESEND_API_KEY: "re_test",
      CONTACT_TO_EMAIL: "hello@chsantana.com",
      RESEND_FROM_EMAIL: "hello@chsantana.com",
    },
    fetcher,
  );

  assert.equal(result.status, 500);
  assert.equal(called, false);
});

test("contact submissions reject invalid profile URLs before sending", async () => {
  let called = false;
  const fetcher: typeof fetch = async () => {
    called = true;
    return new Response(null, { status: 200 });
  };

  const result = await processContactSubmission(
    { ...validSubmission, linkedin: "https://example.com/not-linkedin" },
    "https://chsantana.com",
    { RESEND_API_KEY: "re_test" },
    fetcher,
  );

  assert.equal(result.status, 400);
  assert.equal(called, false);
});

test("the honeypot accepts bots without sending email", async () => {
  let called = false;
  const fetcher: typeof fetch = async () => {
    called = true;
    return new Response(null, { status: 200 });
  };

  const result = await processContactSubmission(
    { ...validSubmission, company: "Spam Incorporated" },
    "https://chsantana.com",
    { RESEND_API_KEY: "re_test" },
    fetcher,
  );

  assert.equal(result.status, 200);
  assert.equal(called, false);
});
