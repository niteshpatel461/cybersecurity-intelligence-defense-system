import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { INITIAL_ADVISORIES } from "./seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "sentinelcore-data.json");

class DatabaseRepository {
  constructor() {
    this.advisories = [...INITIAL_ADVISORIES];
    this.reports = [];
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const data = JSON.parse(raw);
        if (Array.isArray(data.advisories) && data.advisories.length > 0) {
          this.advisories = data.advisories;
        }
        if (Array.isArray(data.reports)) {
          this.reports = data.reports;
        }
      } else {
        this.saveToFile();
      }
      this.isInitialized = true;
    } catch (err) {
      // In-memory fallback if file system access fails
      console.warn("[Repository] Persistent storage warning, operating in memory-only mode:", err.message);
      this.isInitialized = true;
    }
  }

  saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const payload = {
        advisories: this.advisories,
        reports: this.reports,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
    } catch (err) {
      console.warn("[Repository] Failed to write DB file:", err.message);
    }
  }

  /**
   * Get all advisories with optional query filtering
   */
  async getAdvisories({ severity, category, search, limit } = {}) {
    let result = [...this.advisories];

    if (severity) {
      result = result.filter(
        (a) => a.severity.toLowerCase() === severity.toLowerCase()
      );
    }

    if (category) {
      result = result.filter(
        (a) => a.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          (a.cve && a.cve.toLowerCase().includes(q))
      );
    }

    if (limit && Number(limit) > 0) {
      result = result.slice(0, Number(limit));
    }

    return result;
  }

  /**
   * Find advisory by ID or CVE
   */
  async getAdvisoryById(idOrCve) {
    const q = idOrCve.toLowerCase();
    return (
      this.advisories.find(
        (a) => a.id.toLowerCase() === q || (a.cve && a.cve.toLowerCase() === q)
      ) || null
    );
  }

  /**
   * Save a security incident report
   */
  async createReport({ reporterEmail, incidentType, severity = "medium", description }) {
    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const year = new Date().getFullYear();
    const ticketId = `SC-${year}-${randomSuffix}`;

    const report = {
      id: crypto.randomUUID(),
      ticketId,
      reporterEmail,
      incidentType,
      severity,
      description,
      status: "Triage_Queued",
      createdAt: new Date().toISOString(),
    };

    this.reports.unshift(report);
    this.saveToFile();

    return report;
  }

  /**
   * Retrieve report by ticketId
   */
  async getReportByTicketId(ticketId) {
    return this.reports.find((r) => r.ticketId === ticketId) || null;
  }

  /**
   * List all reports (admin/internal usage)
   */
  async getAllReports() {
    return [...this.reports];
  }
}

export const repository = new DatabaseRepository();

