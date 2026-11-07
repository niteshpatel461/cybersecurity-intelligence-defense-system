import { repository } from "../db/repository.js";

/**
 * Security Advisories Controller
 * Endpoint: GET /api/advisories
 * Returns curated list of recent CVEs/threat bulletins (CVE-ID, severity, summary, date, category)
 */
export async function getAdvisories(req, res, next) {
  try {
    const { severity, category, search, limit } = req.query;
    const advisories = await repository.getAdvisories({
      severity,
      category,
      search,
      limit,
    });

    res.status(200).json({
      success: true,
      count: advisories.length,
      data: advisories,
      // Alias property for frontend compatibility
      advisories,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Endpoint: GET /api/advisories/:id
 */
export async function getAdvisoryById(req, res, next) {
  try {
    const { id } = req.params;
    const advisory = await repository.getAdvisoryById(id);

    if (!advisory) {
      return res.status(404).json({
        success: false,
        error: `Security advisory with ID or CVE '${id}' not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: advisory,
      advisory,
    });
  } catch (err) {
    next(err);
  }
}

