import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("GET /api/health returns 200 with status healthy, timestamp and uptime", async () => {
  const res = await request(app).get("/api/health");

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.status, "healthy");
  assert.ok(typeof res.body.uptime === "number");
  assert.ok(typeof res.body.timestamp === "string");
  assert.ok(res.body.data);
  assert.equal(res.body.data.status, "healthy");
});

test("GET / returns 200 with API informational payload", async () => {
  const res = await request(app).get("/");

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.service, "SentinelCore Security Hub API");
});

test("GET /api/nonexistent returns 404 with standard JSON format", async () => {
  const res = await request(app).get("/api/nonexistent");

  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /Resource not found/);
});

