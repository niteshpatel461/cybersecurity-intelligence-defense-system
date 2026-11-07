import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, AlertTriangle, Bug, Lock, Search, Shield } from "lucide-react";
import { ThreatFeed } from "@/components/ThreatFeed";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SentinelCore — Threat Intelligence & Defense Hub" },
      { name: "description", content: "Enterprise cybersecurity portal with live threat feeds, password auditing and URL scanning." },
      { property: "og:title", content: "SentinelCore — Threat Intelligence & Defense Hub" },
      { property: "og:description", content: "Live threat feeds, password auditing, URL scanning and incident reporting." },
    ],
  }),
  component: Index,
});

const stats = [
  { icon: Bug, label: "Active CVEs Tracked", value: "1,284", tone: "text-secondary" },
  { icon: AlertTriangle, label: "Zero-Day Alerts", value: "7", tone: "text-destructive" },
  { icon: Activity, label: "Global Threat Level", value: "Elevated", tone: "text-warning" },
];

function Index() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <section className="glass glow-border relative overflow-hidden p-8 md:p-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-1 font-mono text-xs text-primary">
          <Shield className="h-3.5 w-3.5" /> SYSTEMS NOMINAL · MONITORING 24/7
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Enterprise <span className="text-gradient">Threat Intelligence</span> & Defense Hub
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Track vulnerabilities, audit credentials, scan suspicious links and escalate incidents — from one command center.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/threat-scanner" className="btn-cyber"><Search className="h-4 w-4" /> Scan a URL</Link>
          <Link to="/password-auditor" className="inline-flex items-center gap-2 rounded-md border px-5 py-2.5 font-medium hover:bg-muted"><Lock className="h-4 w-4" /> Audit Password</Link>
        </div>
      </section>
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass p-5">
            <s.icon className={`h-5 w-5 ${s.tone}`} />
            <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
            <p className={`mt-1 font-mono text-3xl font-bold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </section>
      <section className="mt-8"><ThreatFeed limit={4} /></section>
    </div>
  );
}
