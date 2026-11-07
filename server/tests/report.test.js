import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("POST /api/report successfully records incident report and returns 201 with ticketId", async () => {
  const res = await request(app)
    .post("/api/report")
    .send({
      reporterEmail: "soc-analyst@enterprise.corp",
      incidentType: "Phishing Campaign",
      description: "Employee reported deceptive QR code phishing email targeting payroll accounts.",
      severity: "high",
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.ok(res.body.ticketId);
  assert.match(res.body.ticketId, /^SC-\d{4}-[A-F0-9]{6}$/);
  assert.ok(res.body.message);
  assert.equal(res.body.data.reporterEmail, "soc-analyst@enterprise.corp");
  assert.equal(res.body.data.severity, "high");
});

test("POST /api/report sanitizes XSS injection payloads from inputs", async () => {
  const xssPayload = "Attacker injected <script>alert('xss')</script><iframe src='javascript:malicious()'></iframe> data breach in progress.";
  const res = await request(app)
    .post("/api/report")
    .send({
      reporterEmail: "tester@security.io",
      incidentType: "Malware Attack",
      description: xssPayload,
      severity: "critical",
    });

  assert.equal(res.status, 201);
  // Verify HTML tags are stripped
  assert.doesNotMatch(res.body.data.description, /<script>/i);
  assert.doesNotMatch(res.body.data.description, /<iframe>/i);
  assert.ok(res.body.data.description.includes("data breach in progress"));
});

test("POST /api/report accepts frontend field aliases (email, category)", async () => {
  const res = await request(app)
    .post("/api/report")
    .send({
      email: "engineer@company.com",
      category: "DDoS",
      description: "Edge API gateways experiencing severe UDP flood from unknown botnet.",
      severity: "critical",
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.ok(res.body.ticketId);
});

test("POST /api/report rejects invalid email format", async () => {
  const res = await request(app)
    .post("/api/report")
    .send({
      reporterEmail: "not-an-email",
      incidentType: "Phishing",
      description: "Valid description of the incident event.",
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /reporterEmail/i);
});

test("POST /api/report rejects description shorter than 10 characters", async () => {
  const res = await request(app)
    .post("/api/report")
    .send({
      reporterEmail: "analyst@corp.com",
      incidentType: "Phishing",
      description: "Too short",
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /at least 10 characters/i);
});

