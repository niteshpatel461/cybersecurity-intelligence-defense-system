/**
 * URL Threat & Reputation Scanner Service
 * Heuristic analysis detecting:
 * - Suspicious TLDs
 * - IP literal hosts
 * - Excessive subdomains
 * - Homoglyphs / IDN Punycode spoofing
 * - Phishing keywords, port anomalies, credential spoofing
 */

const SUSPICIOUS_TLDS = new Set([
  "zip",
  "mov",
  "xyz",
  "top",
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
  "buzz",
  "club",
  "work",
  "icu",
  "cam",
  "ru",
  "country",
  "stream",
  "fit",
  "rest",
  "sur",
  "kim",
]);

const PHISHING_KEYWORDS = [
  "login",
  "signin",
  "verify",
  "verification",
  "account",
  "security",
  "banking",
  "authenticate",
  "wallet",
  "update",
  "recover",
  "support",
  "credential",
  "password",
  "webmail",
  "portal",
  "confirm",
  "billing",
  "auth",
];

// Regex for IPv4 literal (e.g. 192.168.1.1, 45.33.32.156)
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Regex for IPv6 literal (e.g. [2001:db8::1] or without brackets)
const IPV6_REGEX = /^\[?[a-fA-F0-9:]+\]?$/;

// Common Cyrillic and Greek lookalike character ranges (used in homograph attacks)
// Cyrillic: \u0400-\u04FF, Greek: \u0370-\u03FF, Hebrew: \u0590-\u05FF
const HOMOGLYPH_REGEX = /[\u0400-\u04FF\u0370-\u03FF\u0590-\u05FF]/;

export function scanUrl(rawInput) {
  if (!rawInput || typeof rawInput !== "string") {
    throw new Error("Target URL is required and must be a non-empty string");
  }

  const trimmed = rawInput.trim();
  if (trimmed.length > 2048) {
    throw new Error("URL exceeds maximum length of 2048 characters");
  }

  // Prepend protocol if absent so new URL() can parse bare domains
  let normalizedInput = trimmed;
  if (!/^https?:\/\//i.test(normalizedInput)) {
    normalizedInput = "https://" + normalizedInput;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(normalizedInput);
  } catch (err) {
    throw new Error(`Invalid URL format: ${err.message}`);
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(`Unsupported protocol '${parsedUrl.protocol}'. Only HTTP and HTTPS are permitted.`);
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname.toLowerCase();
  const search = parsedUrl.search.toLowerCase();
  const fullHref = parsedUrl.href;

  const detectedFlags = [];
  const structuredFlags = [];
  let riskScore = 0;

  // 1. Check for IP Literal Host
  const isIpv4 = IPV4_REGEX.test(hostname);
  const isIpv6 = hostname.includes(":") && IPV6_REGEX.test(hostname);
  if (isIpv4 || isIpv6) {
    riskScore += 35;
    const detail = `Target host (${hostname}) is a raw IP literal. Malware campaigns and C2 servers frequently use IP addresses to bypass domain reputation checks.`;
    detectedFlags.push(`IP Literal Host: ${hostname}`);
    structuredFlags.push({
      label: "Raw IP host",
      level: "high",
      detail,
    });
  }

  // 2. Check for Homoglyphs / Punycode (IDN Homograph attacks)
  const isPunycode = hostname.startsWith("xn--") || hostname.includes(".xn--");
  const hasLookalikes = HOMOGLYPH_REGEX.test(trimmed);

  if (isPunycode || hasLookalikes) {
    riskScore += 40;
    const detail = `Domain utilizes Internationalized Domain Name (Punycode/Homoglyphs). Attackers use visually identical Unicode glyphs to impersonate legitimate domains.`;
    detectedFlags.push("Punycode / Homoglyph Attack Indicator Detected");
    structuredFlags.push({
      label: "Homoglyph Attack",
      level: "critical",
      detail,
    });
  }

  // 3. Check for Suspicious TLD
  const domainParts = hostname.split(".");
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : "";
  if (SUSPICIOUS_TLDS.has(tld)) {
    riskScore += 25;
    const detail = `Top-level domain (.${tld}) is statistically associated with high abuse rates in phishing, spam, and malware delivery.`;
    detectedFlags.push(`Suspicious TLD: .${tld}`);
    structuredFlags.push({
      label: "Risky TLD",
      level: "medium",
      detail,
    });
  }

  // 4. Check for Excessive Subdomain Depth
  // e.g. login.secure.bank.attacker.com has >= 4 parts without IP
  if (!isIpv4 && !isIpv6 && domainParts.length >= 4) {
    riskScore += 20;
    const detail = `Hostname exhibits ${domainParts.length} nested subdomain levels. Threat actors nest subdomains to disguise the true landing domain on mobile screens.`;
    detectedFlags.push(`Excessive Subdomains: ${domainParts.length} levels detected`);
    structuredFlags.push({
      label: "Excessive Subdomains",
      level: "medium",
      detail,
    });
  }

  // 5. Phishing / Credential Lure Keywords Check
  const combinedPathAndQuery = pathname + search;
  const foundKeywords = PHISHING_KEYWORDS.filter(
    (kw) =>
      hostname.includes(kw) ||
      combinedPathAndQuery.includes(`/${kw}`) ||
      combinedPathAndQuery.includes(`=${kw}`) ||
      combinedPathAndQuery.includes(`-${kw}`)
  );

  if (foundKeywords.length > 0) {
    riskScore += 25;
    const detail = `URL contains high-risk phishing keywords [${foundKeywords.slice(0, 3).join(", ")}] typically associated with credential harvesting pages.`;
    detectedFlags.push(`Phishing Keywords: [${foundKeywords.join(", ")}]`);
    structuredFlags.push({
      label: "Phishing keywords",
      level: "high",
      detail,
    });
  }

  // 6. Insecure HTTP Protocol
  if (parsedUrl.protocol === "http:") {
    riskScore += 15;
    const detail = "Target is served over unencrypted HTTP. Credentials and traffic are vulnerable to eavesdropping and interception.";
    detectedFlags.push("Unencrypted HTTP Protocol");
    structuredFlags.push({
      label: "No HTTPS",
      level: "medium",
      detail,
    });
  }

  // 7. Non-Standard Port Anomaly
  if (parsedUrl.port && !["80", "443"].includes(parsedUrl.port)) {
    riskScore += 15;
    const detail = `Target explicitly binds to non-standard port :${parsedUrl.port}. Malicious services often run on alternative ports to bypass standard web filtering.`;
    detectedFlags.push(`Non-Standard Port: :${parsedUrl.port}`);
    structuredFlags.push({
      label: "Non-standard Port",
      level: "medium",
      detail,
    });
  }

  // 8. Authority / Embedded Credentials Check (@ symbol in URL authority)
  if (parsedUrl.username || parsedUrl.password || trimmed.includes("@")) {
    riskScore += 30;
    const detail = "URL contains '@' userinfo separator in the authority component. This technique is used to deceive users into trusting a spoofed leading domain.";
    detectedFlags.push("Authority Spoofing (@ Character in URL)");
    structuredFlags.push({
      label: "Authority Spoofing",
      level: "high",
      detail,
    });
  }

  // 9. Obfuscated / Excessive URL Length
  if (trimmed.length > 85) {
    riskScore += 10;
    const detail = `URL is unusually long (${trimmed.length} characters), which may indicate obfuscated payload parameters or base64 redirections.`;
    detectedFlags.push(`Abnormally Long URL: ${trimmed.length} characters`);
    structuredFlags.push({
      label: "Obfuscated length",
      level: "low",
      detail,
    });
  }

  // Clean state handling
  if (detectedFlags.length === 0) {
    detectedFlags.push("No heuristic red flags found");
    structuredFlags.push({
      label: "No indicators",
      level: "low",
      detail: "No known malicious patterns or heuristic indicators were identified for this target.",
    });
  }

  const finalRiskScore = Math.min(100, Math.max(0, riskScore));

  // Determine status: 'Clean' | 'Suspicious' | 'Malicious'
  let status = "Clean";
  if (finalRiskScore >= 60) {
    status = "Malicious";
  } else if (finalRiskScore >= 30) {
    status = "Suspicious";
  }

  return {
    target: fullHref,
    targetUrl: fullHref,
    riskScore: finalRiskScore,
    status,
    detectedFlags,
    flags: structuredFlags,
  };
}

