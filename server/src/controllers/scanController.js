import { scanUrl } from "../services/urlScannerService.js";

/**
 * URL & Domain Threat Scanner Controller
 * Endpoint: POST /api/scan-url
 * Accepts: { targetUrl: string } (or { url: string })
 * Validates URL syntax and checks against common heuristics:
 * - Suspicious TLDs
 * - IP literal hosts
 * - Excessive subdomains
 * - Homoglyphs / Punycode spoofing
 * Returns: riskScore, status ('Clean', 'Suspicious', 'Malicious'), detectedFlags: [string]
 */
export function scanTargetUrl(req, res, next) {
  try {
    const targetUrl = req.body?.targetUrl || req.body?.url;

    if (!targetUrl || typeof targetUrl !== "string" || !targetUrl.trim()) {
      return res.status(400).json({
        success: false,
        error: "Field 'targetUrl' (or 'url') is required and must be a non-empty string.",
      });
    }

    const scanResult = scanUrl(targetUrl);

    res.status(200).json({
      success: true,
      data: scanResult,
      // Root-level fields matching specification
      targetUrl: scanResult.targetUrl,
      target: scanResult.target,
      riskScore: scanResult.riskScore,
      status: scanResult.status,
      detectedFlags: scanResult.detectedFlags,
      flags: scanResult.flags,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

