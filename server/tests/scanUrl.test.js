import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("POST /api/scan-url flags clean standard domain", async () => {
  const res = await request(app)
    .post("/api/scan-url")
    .send({ targetUrl: "https://example.com" });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.status, "Clean");
  assert.ok(res.body.riskScore < 30);
  assert.ok(Array.isArray(res.body.detectedFlags));
});

test("POST /api/scan-url detects raw IP literal host", async () => {
  const res = await request(app)
    .post("/api/scan-url")
    .send({ targetUrl: "http://45.33.32.156/malware.bin" });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.riskScore >= 35);
  assert.ok(
    res.body.detectedFlags.some((f) => f.includes("IP Literal Host")),
    "Should detect IP Literal Host"
  );
});

test("POST /api/scan-url detects suspicious TLD and phishing keywords", async () => {
  const res = await request(app)
    .post("/api/scan-url")
    .send({ targetUrl: "http://secure-login-account.xyz/verify" });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.riskScore >= 50);
  assert.ok(["Suspicious", "Malicious"].includes(res.body.status));
  assert.ok(res.body.detectedFlags.some((f) => f.includes(".xyz")));
  assert.ok(res.body.detectedFlags.some((f) => f.includes("Phishing Keywords")));
});

test("POST /api/scan-url detects punycode / homoglyph domains", async () => {
  const res = await request(app)
    .post("/api/scan-url")
    .send({ targetUrl: "https://xn--pypal-4ve.com/signin" });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.riskScore >= 40);
  assert.ok(res.body.detectedFlags.some((f) => f.includes("Homoglyph")));
});

test("POST /api/scan-url accepts 'url' field alias", async () => {
  const res = await request(app)
    .post("/api/scan-url")
    .send({ url: "https://trusted-site.org" });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.target.includes("trusted-site.org"));
});

test("POST /api/scan-url rejects invalid or missing targetUrl", async () => {
  const res = await request(app)
    .post("/api/scan-url")
    .send({});

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

