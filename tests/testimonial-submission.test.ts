import assert from "node:assert/strict";
import test from "node:test";
import {
  envFromRequest,
  inspectImage,
  processTestimonialSubmission,
  resolveTestimonialEnvironment,
} from "../server/utils/testimonialSubmission.ts";

function png(width = 512, height = 512) {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function validForm() {
  const form = new FormData();
  form.set("name", "Ada Lovelace");
  form.set("role", "Systems Engineer");
  form.set("linkedin", "https://www.linkedin.com/in/ada-lovelace");
  form.set("website", "https://example.com");
  form.set("quote", "Christopher made the complex parts feel straightforward.");
  form.set("company", "");
  form.set(
    "photo",
    new Blob([png()], { type: "image/png" }),
    "portrait.png",
  );
  return form;
}

const environment = {
  NUXT_PUBLIC_SANITY_PROJECT_ID: "project",
  NUXT_PUBLIC_SANITY_DATASET: "production",
  SANITY_API_WRITE_TOKEN: "secret",
};

test("recognizes PNG dimensions from file bytes", () => {
  assert.deepEqual(inspectImage(png(640, 480)), {
    contentType: "image/png",
    extension: "png",
    width: 640,
    height: 480,
  });
});

test("uploads the image and creates an unpublished Sanity draft", async () => {
  const requests: { url: string; init?: RequestInit }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    requests.push({ url: String(input), init });
    if (String(input).includes("/assets/images/")) {
      return Response.json({ document: { _id: "image-asset-id" } });
    }
    return Response.json({ transactionId: "transaction-id" });
  };

  const result = await processTestimonialSubmission(
    validForm(),
    "https://chsantana.com",
    environment,
    fetcher,
  );

  assert.equal(result.status, 200);
  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /\/assets\/images\/production/);
  const mutation = JSON.parse(String(requests[1].init?.body));
  const document = mutation.mutations[0].create;
  assert.match(document._id, /^drafts\./);
  assert.equal(document._type, "testimonial");
  assert.equal(document.photo.asset._ref, "image-asset-id");
});

test("rejects image files outside the dimension limits", async () => {
  const form = validForm();
  form.set(
    "photo",
    new Blob([png(128, 128)], { type: "image/png" }),
    "tiny.png",
  );
  let called = false;

  const result = await processTestimonialSubmission(
    form,
    "https://chsantana.com",
    environment,
    async () => {
      called = true;
      return new Response();
    },
  );

  assert.equal(result.status, 400);
  assert.equal(called, false);
});

test("returns unavailable when Sanity write configuration is missing", async () => {
  let called = false;

  const result = await processTestimonialSubmission(
    validForm(),
    "https://chsantana.com",
    {
      NUXT_PUBLIC_SANITY_PROJECT_ID: "",
      NUXT_PUBLIC_SANITY_DATASET: "",
      SANITY_API_WRITE_TOKEN: "",
    },
    async () => {
      called = true;
      return new Response();
    },
  );

  assert.equal(result.status, 503);
  assert.equal(called, false);
});

test("resolves write config from Cloudflare request bindings", () => {
  assert.deepEqual(
    resolveTestimonialEnvironment(
      {},
      {
        NUXT_PUBLIC_SANITY_PROJECT_ID: "runtime-project",
        NUXT_PUBLIC_SANITY_DATASET: "runtime-dataset",
        SANITY_API_WRITE_TOKEN: "runtime-token",
      },
    ),
    {
      NUXT_PUBLIC_SANITY_PROJECT_ID: "runtime-project",
      NUXT_PUBLIC_SANITY_DATASET: "runtime-dataset",
      SANITY_API_WRITE_TOKEN: "runtime-token",
    },
  );
  assert.equal(
    resolveTestimonialEnvironment(
      {},
      { NUXT_SANITY_API_WRITE_TOKEN: "nuxt-token" },
    ).SANITY_API_WRITE_TOKEN,
    "nuxt-token",
  );
  assert.equal(
    envFromRequest({
      context: { cloudflare: { env: { SANITY_API_WRITE_TOKEN: "cf-token" } } },
    }).SANITY_API_WRITE_TOKEN,
    "cf-token",
  );
});

test("accepts Cloudflare Pages preview origins", async () => {
  const result = await processTestimonialSubmission(
    validForm(),
    "https://site.pages.dev",
    {
      NUXT_PUBLIC_SANITY_PROJECT_ID: "",
      NUXT_PUBLIC_SANITY_DATASET: "",
      SANITY_API_WRITE_TOKEN: "",
    },
    async () => new Response(),
  );

  assert.equal(result.status, 503);
});

test("the testimonial honeypot accepts bots without uploading", async () => {
  const form = validForm();
  form.set("company", "Spam Incorporated");
  let called = false;

  const result = await processTestimonialSubmission(
    form,
    "https://chsantana.com",
    environment,
    async () => {
      called = true;
      return new Response();
    },
  );

  assert.equal(result.status, 200);
  assert.equal(called, false);
});
