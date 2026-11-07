export const API_BASE_URL: string =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) || "http://localhost:5000";

export type Severity = "critical" | "high" | "medium" | "low";

export interface Advisory {
  id: string;
  title: string;
  severity: Severity;
  cve?: string;
  published: string;
  summary: string;
}
export interface PasswordResult {
  score: number;
  entropy: number;
  recommendations: string[];
  mock?: boolean;
}
export interface ScanFlag { label: string; level: Severity; detail: string }
export interface ScanResult { target: string; riskScore: number; flags: ScanFlag[]; mock?: boolean }
export interface IncidentReport {
  email: string;
  category: string;
  description: string;
  severity: Severity;
}
export interface ReportResult { ticketId: string; mock?: boolean }

async function request<T>(path: string, init?: RequestInit, timeoutMs = 5000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

/* ---------- Mock fallbacks ---------- */
export const MOCK_ADVISORIES: Advisory[] = [
  { id: "a1", title: "Remote code execution in popular edge gateway", severity: "critical", cve: "CVE-2026-31337", published: "2026-11-05", summary: "Unauthenticated RCE via crafted HTTP/2 headers. Patch immediately." },
  { id: "a2", title: "Auth bypass in SSO SAML parser", severity: "high", cve: "CVE-2026-29871", published: "2026-11-04", summary: "Signature wrapping allows impersonation of arbitrary users." },
  { id: "a3", title: "Credential-stuffing campaign targeting VPN portals", severity: "high", published: "2026-11-03", summary: "Botnet observed rotating 40k residential IPs against SSL VPNs." },
  { id: "a4", title: "Privilege escalation in container runtime", severity: "medium", cve: "CVE-2026-27410", published: "2026-11-02", summary: "Symlink race allows escape from rootless containers." },
  { id: "a5", title: "Phishing kit impersonating payroll providers", severity: "low", published: "2026-11-01", summary: "New kit uses QR codes to evade email link scanners." },
];

export function localPasswordAudit(pw: string): PasswordResult {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  const entropy = pw.length ? Math.round(pw.length * Math.log2(pool || 1)) : 0;
  const score = Math.min(100, Math.round((entropy / 100) * 100));
  const recs: string[] = [];
  if (pw.length < 12) recs.push("Use at least 12 characters (16+ recommended).");
  if (!/[A-Z]/.test(pw)) recs.push("Add uppercase letters.");
  if (!/[a-z]/.test(pw)) recs.push("Add lowercase letters.");
  if (!/\d/.test(pw)) recs.push("Include numbers.");
  if (!/[^A-Za-z0-9]/.test(pw)) recs.push("Include symbols like !@#$%.");
  if (/(.)\1{2,}/.test(pw)) recs.push("Avoid repeated characters.");
  if (/password|1234|qwerty|admin/i.test(pw)) recs.push("Avoid common words and sequences.");
  if (!recs.length) recs.push("Strong password. Store it in a password manager and enable MFA.");
  return { score, entropy, recommendations: recs };
}

function mockScan(target: string): ScanResult {
  const flags: ScanFlag[] = [];
  const t = target.toLowerCase();
  if (!t.startsWith("https")) flags.push({ label: "No HTTPS", level: "medium", detail: "Target not served over TLS." });
  if (/login|verify|secure|account|update/.test(t)) flags.push({ label: "Phishing keywords", level: "high", detail: "URL contains credential-lure terms." });
  if (/\d+\.\d+\.\d+\.\d+/.test(t)) flags.push({ label: "Raw IP host", level: "high", detail: "Direct IP hosts are common in malware delivery." });
  if (/\.(zip|xyz|top|tk|ru)(\/|$)/.test(t)) flags.push({ label: "Risky TLD", level: "medium", detail: "TLD has elevated abuse rates." });
  if (t.length > 75) flags.push({ label: "Obfuscated length", level: "low", detail: "Unusually long URL." });
  if (!flags.length) flags.push({ label: "No indicators", level: "low", detail: "No heuristic red flags found." });
  const weight = { critical: 40, high: 30, medium: 15, low: 3 };
  const riskScore = Math.min(100, flags.reduce((s, f) => s + weight[f.level], 0));
  return { target, riskScore, flags, mock: true };
}

/* ---------- Public API ---------- */
export const api = {
  async health(): Promise<boolean> {
    try {
      await request("/api/health", undefined, 3000);
      return true;
    } catch {
      return false;
    }
  },
  async advisories(): Promise<{ data: Advisory[]; mock: boolean }> {
    try {
      const data = await request<Advisory[] | { advisories: Advisory[] }>("/api/advisories");
      return { data: Array.isArray(data) ? data : data.advisories, mock: false };
    } catch {
      return { data: MOCK_ADVISORIES, mock: true };
    }
  },
  async checkPassword(password: string): Promise<PasswordResult> {
    try {
      return await request<PasswordResult>("/api/check-password", { method: "POST", body: JSON.stringify({ password }) });
    } catch {
      return { ...localPasswordAudit(password), mock: true };
    }
  },
  async scanUrl(url: string): Promise<ScanResult> {
    try {
      return await request<ScanResult>("/api/scan-url", { method: "POST", body: JSON.stringify({ url }) });
    } catch {
      await new Promise((r) => setTimeout(r, 1200));
      return mockScan(url);
    }
  },
  async report(payload: IncidentReport): Promise<ReportResult> {
    try {
      return await request<ReportResult>("/api/report", { method: "POST", body: JSON.stringify(payload) });
    } catch {
      return { ticketId: `SC-${Date.now().toString(36).toUpperCase()}`, mock: true };
    }
  },
};
