import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api, type ScanResult } from "@/services/api";
import { MockNote, PageTitle, SeverityBadge } from "@/components/ui-bits";

export const Route = createFileRoute("/threat-scanner")({
  head: () => ({
    meta: [
      { title: "Domain & URL Scanner — SentinelCore" },
      { name: "description", content: "Quickly scan domains and URLs for phishing and malware risk indicators." },
      { property: "og:title", content: "Domain & URL Scanner — SentinelCore" },
      { property: "og:description", content: "Scan URLs for risk indicators." },
    ],
  }),
  component: Scanner,
});

function Scanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ScanResult | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true); setRes(null);
    setRes(await api.scanUrl(url.trim()));
    setLoading(false);
  };

  const r = res?.riskScore ?? 0;
  const badge = r >= 60 ? "bg-destructive/15 text-destructive border-destructive/50" : r >= 30 ? "bg-warning/15 text-warning border-warning/50" : "bg-primary/10 text-primary border-primary/40";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageTitle icon={<Search className="h-4 w-4" />} title="Domain & URL Quick Scanner" sub="Heuristic reputation analysis for suspicious links, domains and IPs." />
      <form onSubmit={submit} className="glass glow-border flex flex-col gap-3 p-5 sm:flex-row">
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="input-cyber" placeholder="https://example.com/login" />
        <button className="btn-cyber shrink-0" disabled={loading}>{loading ? "Scanning…" : "Scan"}</button>
      </form>

      {loading && (
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="relative h-40 w-40 overflow-hidden rounded-full border border-primary/40 glow-primary">
            <div className="absolute inset-6 rounded-full border border-primary/20" />
            <div className="absolute inset-12 rounded-full border border-primary/20" />
            <div className="absolute inset-0 animate-radar" style={{ background: "conic-gradient(from 0deg, color-mix(in oklab, var(--primary) 50%, transparent), transparent 30%)" }} />
          </div>
          <p className="font-mono text-sm text-primary">$ probing {url}…</p>
        </div>
      )}

      {res && (
        <div className="mt-8">
          <div className="glass flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="truncate font-mono">{res.target}</p>
            </div>
            <span className={`rounded-lg border px-4 py-2 font-mono text-lg font-bold ${badge}`}>RISK {r}/100</span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {res.flags.map((f) => (
              <div key={f.label} className="glass p-4">
                <div className="flex items-center justify-between"><p className="font-semibold">{f.label}</p><SeverityBadge level={f.level} /></div>
                <p className="mt-2 font-mono text-xs text-muted-foreground">&gt; {f.detail}</p>
              </div>
            ))}
          </div>
          <MockNote show={res.mock} />
        </div>
      )}
    </div>
  );
}
