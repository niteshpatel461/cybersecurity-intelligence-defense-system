import { processIncidentReport } from "../services/reportService.js";

/**
 * Incident Report Controller
 * Endpoint: POST /api/report
 * Accepts: { reporterEmail: string, incidentType: string, description: string, severity?: string }
 * Validates input, sanitizes against XSS, and saves to database.
 * Returns: 201 Created with ticketId and confirmation message.
 */
export async function submitIncidentReport(req, res, next) {
  try {
    const {
      reporterEmail,
      email,
      incidentType,
      category,
      description,
      severity,
    } = req.body || {};

    const resolvedEmail = reporterEmail || email;
    const resolvedType = incidentType || category;

    const result = await processIncidentReport({
      reporterEmail: resolvedEmail,
      incidentType: resolvedType,
      description,
      severity,
    });

    res.status(201).json({
      success: true,
      ticketId: result.ticketId,
      message: result.confirmationMessage,
      data: result.report,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

