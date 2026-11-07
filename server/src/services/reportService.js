import sanitizeHtml from "sanitize-html";
import { repository } from "../db/repository.js";

const VALID_SEVERITIES = new Set(["low", "medium", "high", "critical"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SANITIZE_OPTIONS = {
  allowedTags: [], // Strip all HTML tags
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

export async function processIncidentReport({
  reporterEmail,
  incidentType,
  description,
  severity = "medium",
}) {
  // 1. Validation
  if (!reporterEmail || typeof reporterEmail !== "string") {
    throw new Error("Field 'reporterEmail' is required and must be a valid email string.");
  }
  const cleanEmail = reporterEmail.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 255) {
    throw new Error("Invalid 'reporterEmail' address format.");
  }

  if (!incidentType || typeof incidentType !== "string" || !incidentType.trim()) {
    throw new Error("Field 'incidentType' is required.");
  }
  const cleanType = incidentType.trim();

  if (!description || typeof description !== "string") {
    throw new Error("Field 'description' is required.");
  }
  const rawDescription = description.trim();
  if (rawDescription.length < 10) {
    throw new Error("Field 'description' must contain at least 10 characters describing the incident.");
  }
  if (rawDescription.length > 5000) {
    throw new Error("Field 'description' exceeds maximum allowed length of 5000 characters.");
  }

  const cleanSeverity = (severity || "medium").toString().toLowerCase().trim();
  const finalSeverity = VALID_SEVERITIES.has(cleanSeverity) ? cleanSeverity : "medium";

  // 2. XSS Sanitization using sanitize-html
  const sanitizedDescription = sanitizeHtml(rawDescription, SANITIZE_OPTIONS);
  const sanitizedIncidentType = sanitizeHtml(cleanType, SANITIZE_OPTIONS);
  const sanitizedEmail = sanitizeHtml(cleanEmail, SANITIZE_OPTIONS);

  // 3. Save to database repository
  const savedReport = await repository.createReport({
    reporterEmail: sanitizedEmail,
    incidentType: sanitizedIncidentType,
    severity: finalSeverity,
    description: sanitizedDescription,
  });

  return {
    ticketId: savedReport.ticketId,
    confirmationMessage: "Security incident reported successfully. Triage response team notified.",
    report: savedReport,
  };
}

