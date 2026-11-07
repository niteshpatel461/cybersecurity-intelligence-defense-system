import { evaluatePassword } from "../services/passwordService.js";

/**
 * Password Auditor Controller
 * Endpoint: POST /api/check-password
 * Accepts: { password: string }
 * Evaluates: Length, entropy, character mix (upper, lower, digit, symbol), common dictionary word presence
 * Returns: score (0-100), strength ('weak', 'medium', 'strong'), suggestions (array of string recommendations)
 * SECURITY RULE: Do NOT log the plain password anywhere.
 */
export function checkPassword(req, res, next) {
  try {
    const { password } = req.body || {};

    if (password === undefined || password === null) {
      return res.status(400).json({
        success: false,
        error: "Field 'password' is required in request body.",
      });
    }

    if (typeof password !== "string") {
      return res.status(400).json({
        success: false,
        error: "Field 'password' must be a string.",
      });
    }

    // Evaluate without logging or caching raw password
    const result = evaluatePassword(password);

    res.status(200).json({
      success: true,
      data: result,
      // Root-level fields for straightforward consumption
      score: result.score,
      strength: result.strength,
      entropy: result.entropy,
      suggestions: result.suggestions,
      recommendations: result.recommendations,
      characterMix: result.characterMix,
      commonDictionaryWordDetected: result.commonDictionaryWordDetected,
    });
  } catch (err) {
    next(err);
  }
}

