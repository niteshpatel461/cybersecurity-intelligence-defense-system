import express from "express";
import helmet from "helmet";
import cors from "cors";
import { corsOptions, helmetOptions } from "./config/security.js";
import { generalRateLimiter } from "./middleware/rateLimiter.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler.js";
import apiRouter from "./routes/index.js";

const app = express();

// Trust reverse proxy (e.g. Render, Railway, Cloudflare, NGINX)
app.set("trust proxy", 1);

// Security Middleware: Helmet HTTP headers
app.use(helmet(helmetOptions));

// Security Middleware: CORS
app.use(cors(corsOptions));

// Body parsing with strict size limits to prevent payload flooding DoS
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Security-conscious request logging (passwords redacted)
app.use(requestLogger);

// General rate limiter applied across all /api routes
app.use("/api", generalRateLimiter);

// Silence /favicon.ico 404s
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Root endpoint: Serves interactive testing console in browser (HTML) or API metadata for JSON/curl
app.get("/", (req, res) => {
  if (req.accepts("html") && !req.accepts("json")) {
    return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SentinelCore API Hub - Local Testing Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300ff66' stroke-width='2'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>">
  <style>
    :root {
      --bg: #0B0F19;
      --card-bg: rgba(17, 24, 39, 0.75);
      --border: rgba(0, 255, 102, 0.25);
      --primary: #00FF66;
      --primary-glow: rgba(0, 255, 102, 0.4);
      --cyan: #00E5FF;
      --amber: #F59E0B;
      --red: #EF4444;
      --text: #F3F4F6;
      --text-muted: #9CA3AF;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      padding: 24px;
      line-height: 1.5;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 24px;
    }
    .brand { display: flex; align-items: center; gap: 12px; font-size: 22px; font-weight: 700; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-family: monospace;
      font-size: 13px;
      background: rgba(0,255,102,0.1);
      color: var(--primary);
      border: 1px solid var(--primary);
    }
    .badge .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 8px var(--primary); }
    .nav-links { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .nav-link {
      color: var(--cyan);
      text-decoration: none;
      border: 1px solid rgba(0,229,255,0.3);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 14px;
      font-family: monospace;
      transition: all 0.2s;
    }
    .nav-link:hover, .nav-link.active {
      background: rgba(0,229,255,0.15);
      border-color: var(--cyan);
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    h2 { font-size: 18px; margin-bottom: 16px; color: var(--primary); display: flex; align-items: center; gap: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    input, select, textarea {
      width: 100%;
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.2);
      color: var(--text);
      padding: 10px 14px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 14px;
      margin-bottom: 12px;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 10px var(--primary-glow);
    }
    button {
      background: var(--primary);
      color: #000;
      border: none;
      font-weight: 700;
      padding: 10px 18px;
      border-radius: 6px;
      cursor: pointer;
      font-family: monospace;
      transition: all 0.2s;
    }
    button:hover { background: #33ff85; box-shadow: 0 0 12px var(--primary); }
    pre {
      background: #000;
      padding: 14px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      color: var(--cyan);
      overflow-x: auto;
      max-height: 240px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .meter { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin: 10px 0; }
    .meter-bar { height: 100%; width: 0%; transition: width 0.3s; background: var(--red); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00FF66" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Sentinel<span style="color:var(--primary)">Core</span> Security Hub</span>
      </div>
      <div class="badge"><span class="dot"></span> Backend Port 5000 Online</div>
    </header>

    <div class="nav-links">
      <a class="nav-link" href="http://localhost:5173" target="_blank" style="background:rgba(0,255,102,0.15); border-color:var(--primary); color:var(--primary);">🚀 Launch Full React App (Port 5173)</a>
      <a class="nav-link" href="/api/health" target="_blank">GET /api/health</a>
      <a class="nav-link" href="/api/advisories" target="_blank">GET /api/advisories</a>
      <a class="nav-link" href="/api/advisories?severity=critical" target="_blank">Critical Advisories</a>
    </div>

    <div class="grid">
      <!-- Tool 1: Password Auditor -->
      <div class="card">
        <h2>🔒 Password Strength & Entropy Auditor</h2>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">Audits length, Shannon entropy, character diversity & dictionary words (zero password logging policy).</p>
        <input type="text" id="pwInput" placeholder="Enter password to audit..." value="Sentinel#Core2026!">
        <button onclick="auditPassword()">Audit Password</button>
        <div class="meter"><div class="meter-bar" id="meterBar"></div></div>
        <pre id="pwResult">// Result will appear here...</pre>
      </div>

      <!-- Tool 2: URL Threat Scanner -->
      <div class="card">
        <h2>🌐 Domain & URL Quick Scanner</h2>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">Heuristic analysis: Suspicious TLDs, IP literal hosts, subdomains, homoglyphs / Punycode.</p>
        <input type="text" id="urlInput" placeholder="https://example.com/login" value="http://45.33.32.156/secure-login.xyz">
        <button onclick="scanUrl()">Scan Target URL</button>
        <div style="margin-top:10px;"></div>
        <pre id="urlResult">// Result will appear here...</pre>
      </div>
    </div>

    <!-- Tool 3: Report Incident -->
    <div class="card">
      <h2>🛡️ Security Incident Reporting</h2>
      <div class="grid">
        <div>
          <input type="email" id="repEmail" placeholder="reporter@enterprise.corp" value="analyst@enterprise.corp">
          <select id="repType">
            <option>Phishing</option>
            <option>Malware Outbreak</option>
            <option>Data Breach</option>
            <option>Unauthorized Access</option>
            <option>DDoS</option>
            <option>Other</option>
          </select>
          <select id="repSev">
            <option value="low">Severity: Low</option>
            <option value="medium" selected>Severity: Medium</option>
            <option value="high">Severity: High</option>
            <option value="critical">Severity: Critical</option>
          </select>
        </div>
        <div>
          <textarea id="repDesc" rows="4" placeholder="Incident description (min 10 characters)...">Observed credential harvesting kit spoofing corporate VPN authentication portal.</textarea>
          <button onclick="submitReport()">Submit Incident Report</button>
        </div>
      </div>
      <pre id="repResult" style="margin-top:14px;">// Ticket status will appear here...</pre>
    </div>
  </div>

  <script>
    async function auditPassword() {
      const pw = document.getElementById('pwInput').value;
      const res = await fetch('/api/check-password', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password: pw})
      });
      const data = await res.json();
      document.getElementById('pwResult').innerText = JSON.stringify(data, null, 2);
      const score = data.score || 0;
      const bar = document.getElementById('meterBar');
      bar.style.width = score + '%';
      bar.style.background = score >= 70 ? 'var(--primary)' : score >= 40 ? 'var(--amber)' : 'var(--red)';
    }

    async function scanUrl() {
      const targetUrl = document.getElementById('urlInput').value;
      const res = await fetch('/api/scan-url', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({targetUrl})
      });
      const data = await res.json();
      document.getElementById('urlResult').innerText = JSON.stringify(data, null, 2);
    }

    async function submitReport() {
      const reporterEmail = document.getElementById('repEmail').value;
      const incidentType = document.getElementById('repType').value;
      const severity = document.getElementById('repSev').value;
      const description = document.getElementById('repDesc').value;

      const res = await fetch('/api/report', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({reporterEmail, incidentType, severity, description})
      });
      const data = await res.json();
      document.getElementById('repResult').innerText = JSON.stringify(data, null, 2);
    }

    // Auto-run on load
    auditPassword();
  </script>
</body>
</html>`);
  }

  res.status(200).json({
    success: true,
    service: "SentinelCore Security Hub API",
    status: "online",
    endpoints: {
      health: "GET /api/health",
      advisories: "GET /api/advisories",
      passwordAuditor: "POST /api/check-password",
      urlScanner: "POST /api/scan-url",
      incidentReporting: "POST /api/report",
    },
    documentation: "See README.md for complete API reference.",
  });
});

// Mount /api endpoints
app.use("/api", apiRouter);

// Handle unknown routes (404)
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(globalErrorHandler);

export default app;

