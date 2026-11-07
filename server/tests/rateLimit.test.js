import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("Rate limiting headers are returned on API requests", async () => {
  const res = await request(app).get("/api/health");

  assert.equal(res.status, 200);
  // express-rate-limit with standardHeaders sets 'ratelimit' or 'ratelimit-limit'
  const hasRateLimitHeader =
    res.headers["ratelimit-limit"] ||
    res.headers["ratelimit"] ||
    res.headers["ratelimit-remaining"];

  assert.ok(hasRateLimitHeader, "Rate limit headers should be present");
});

