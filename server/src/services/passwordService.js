/**
 * Password Security Evaluation Service
 * Evaluates length, character mix, entropy, dictionary words, and common patterns.
 * SECURITY NOTICE: The plain password must never be logged or persisted anywhere.
 */

const COMMON_DICTIONARY_WORDS = [
  "password",
  "123456",
  "12345678",
  "123456789",
  "qwerty",
  "admin",
  "administrator",
  "welcome",
  "letmein",
  "iloveyou",
  "dragon",
  "master",
  "monkey",
  "security",
  "pass123",
  "p@ssword",
  "shadow",
  "football",
  "superman",
  "trustno1",
  "mustang",
  "login",
  "root",
  "access",
  "secret",
  "testing",
  "default",
  "sentinel",
];

const SEQUENCES = [
  "abcdefghijklmnopqrstuvwxyz",
  "01234567890",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
];

export function evaluatePassword(pw) {
  if (typeof pw !== "string") {
    throw new TypeError("Password must be a string");
  }

  const length = pw.length;
  const suggestions = [];

  if (length === 0) {
    return {
      score: 0,
      strength: "weak",
      entropy: 0,
      characterMix: {
        length: 0,
        hasUppercase: false,
        hasLowercase: false,
        hasNumbers: false,
        hasSymbols: false,
      },
      commonDictionaryWordDetected: false,
      hasRepeatedChars: false,
      hasSequentialPattern: false,
      suggestions: ["Password cannot be empty.", "Enter at least 12 characters."],
      recommendations: ["Password cannot be empty.", "Enter at least 12 characters."],
    };
  }

  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);

  // Calculate character pool size (R)
  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += 33; // Standard ASCII symbols

  // Pool Entropy in bits: L * log2(R)
  const poolEntropy = length * Math.log2(poolSize || 1);

  // Shannon Entropy: - sum(p * log2(p))
  const freqMap = {};
  for (const ch of pw) {
    freqMap[ch] = (freqMap[ch] || 0) + 1;
  }
  let shannonEntropy = 0;
  for (const count of Object.values(freqMap)) {
    const p = count / length;
    shannonEntropy -= p * Math.log2(p);
  }
  // Total Shannon information bits
  const totalShannonBits = shannonEntropy * length;

  // Composite Entropy estimate
  const entropy = Math.round((poolEntropy * 0.7 + totalShannonBits * 0.3) * 10) / 10;

  // Dictionary words detection (case-insensitive & leetspeak normalization)
  const normalized = pw
    .toLowerCase()
    .replace(/@/g, "a")
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/3/g, "e")
    .replace(/5/g, "s")
    .replace(/\$/g, "s");

  const commonDictionaryWordDetected = COMMON_DICTIONARY_WORDS.some((word) =>
    normalized.includes(word)
  );

  // Repeated characters (3 or more identical characters in a row: e.g. "aaa", "111")
  const hasRepeatedChars = /(.)\1{2,}/.test(pw);

  // Sequential patterns (e.g. "1234", "abcd", "qwerty")
  let hasSequentialPattern = false;
  const lowerPw = pw.toLowerCase();
  for (const seq of SEQUENCES) {
    for (let i = 0; i <= seq.length - 4; i++) {
      const sub = seq.substring(i, i + 4);
      if (lowerPw.includes(sub)) {
        hasSequentialPattern = true;
        break;
      }
    }
    if (hasSequentialPattern) break;
  }

  // --- Score calculation (0 - 100) ---
  let score = 0;

  // 1. Length points (up to 40 pts)
  if (length >= 16) score += 40;
  else if (length >= 14) score += 35;
  else if (length >= 12) score += 28;
  else if (length >= 10) score += 18;
  else if (length >= 8) score += 10;
  else score += Math.max(0, length * 1.5);

  // 2. Character diversity points (up to 30 pts)
  let diversityCount = 0;
  if (hasUpper) diversityCount++;
  if (hasLower) diversityCount++;
  if (hasDigit) diversityCount++;
  if (hasSymbol) diversityCount++;

  score += diversityCount * 7.5; // 4 * 7.5 = 30 pts

  // 3. Entropy points (up to 30 pts)
  if (entropy >= 80) score += 30;
  else if (entropy >= 65) score += 24;
  else if (entropy >= 50) score += 18;
  else if (entropy >= 35) score += 12;
  else score += Math.max(0, entropy * 0.3);

  // Penalties
  if (commonDictionaryWordDetected) score -= 35;
  if (hasRepeatedChars) score -= 15;
  if (hasSequentialPattern) score -= 15;
  if (length < 8) score = Math.min(score, 25);

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determine strength label
  let strength = "weak";
  if (score >= 70) {
    strength = "strong";
  } else if (score >= 40) {
    strength = "medium";
  }

  // Actionable Suggestions
  if (length < 12) {
    suggestions.push("Use at least 12 characters (16+ recommended for strong defense).");
  }
  if (!hasUpper) {
    suggestions.push("Add uppercase letters (A-Z) to increase character space.");
  }
  if (!hasLower) {
    suggestions.push("Add lowercase letters (a-z).");
  }
  if (!hasDigit) {
    suggestions.push("Include numeric digits (0-9).");
  }
  if (!hasSymbol) {
    suggestions.push("Include special symbols like !@#$%^&* to resist brute-force cracking.");
  }
  if (commonDictionaryWordDetected) {
    suggestions.push("Avoid common dictionary words, brand names, or predictable substitutions.");
  }
  if (hasRepeatedChars) {
    suggestions.push("Avoid repeating identical characters 3 or more times consecutively.");
  }
  if (hasSequentialPattern) {
    suggestions.push("Avoid predictable keyboard sequences or ascending numbers (e.g. '1234', 'qwerty').");
  }

  if (suggestions.length === 0) {
    suggestions.push("Excellent password strength! Store it in an encrypted password manager and enforce MFA.");
  }

  return {
    score,
    strength,
    entropy: Math.round(entropy),
    characterMix: {
      length,
      hasUppercase: hasUpper,
      hasLowercase: hasLower,
      hasNumbers: hasDigit,
      hasSymbols: hasSymbol,
    },
    commonDictionaryWordDetected,
    hasRepeatedChars,
    hasSequentialPattern,
    suggestions,
    recommendations: suggestions, // alias for frontend compatibility
  };
}

