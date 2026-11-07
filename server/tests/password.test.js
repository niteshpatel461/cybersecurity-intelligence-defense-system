import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("POST /api/check-password audits weak password", async () => {
  const res = await request(app)
    .post("/api/check-password")
    .send({ password: "password123" });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.strength, "weak");
  assert.ok(res.body.score < 40);
  assert.ok(res.body.suggestions.length > 0);
  assert.equal(res.body.commonDictionaryWordDetected, true);
  // Plain password must NOT be reflected back in top-level output
  assert.equal(res.body.password, undefined);
});

test("POST /api/check-password audits strong password", async () => {
  const res = await request(app)
    .post("/api/check-password")
    .send({ password: "X7#mK9$vL2!qP8@zW4^" });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.strength, "strong");
  assert.ok(res.body.score >= 70);
  assert.ok(res.body.entropy > 60);
  assert.ok(Array.isArray(res.body.suggestions));
});

test("POST /api/check-password rejects empty or missing password field", async () => {
  const res = await request(app)
    .post("/api/check-password")
    .send({});

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /password.*required/i);
});

test("POST /api/check-password rejects non-string password", async () => {
  const res = await request(app)
    .post("/api/check-password")
    .send({ password: 123456 });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /must be a string/i);
});

test("POST /api/check-password detects character repetition", async () => {
  const res = await request(app)
    .post("/api/check-password")
    .send({ password: "aaaaaaaabbbbbb" });

  assert.equal(res.status, 200);
  assert.equal(res.body.data.hasRepeatedChars, true);
});

