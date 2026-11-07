import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("GET /api/advisories returns list of curated CVE threat bulletins", async () => {
  const res = await request(app).get("/api/advisories");

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);

  const first = res.body.data[0];
  assert.ok(first.id, "Advisory must have an ID");
  assert.ok(first.title, "Advisory must have a title");
  assert.ok(first.severity, "Advisory must have a severity");
  assert.ok(first.summary, "Advisory must have a summary");
  assert.ok(first.category, "Advisory must have a category");
  assert.ok(first.date || first.published, "Advisory must have a date");
});

test("GET /api/advisories filters by severity=critical", async () => {
  const res = await request(app).get("/api/advisories?severity=critical");

  assert.equal(res.status, 200);
  assert.ok(res.body.data.length > 0);
  for (const item of res.body.data) {
    assert.equal(item.severity.toLowerCase(), "critical");
  }
});

test("GET /api/advisories filters by limit=2", async () => {
  const res = await request(app).get("/api/advisories?limit=2");

  assert.equal(res.status, 200);
  assert.equal(res.body.data.length, 2);
});

test("GET /api/advisories/:id returns specific advisory", async () => {
  const res = await request(app).get("/api/advisories/adv-2026-001");

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.id, "adv-2026-001");
  assert.equal(res.body.data.cve, "CVE-2026-31337");
});

test("GET /api/advisories/:id returns 404 for unknown advisory", async () => {
  const res = await request(app).get("/api/advisories/unknown-cve-9999");

  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});

