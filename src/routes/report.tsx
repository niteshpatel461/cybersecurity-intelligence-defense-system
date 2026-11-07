import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Shield } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api, type ReportResult, type Severity } from "@/services/api";
import { PageTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Security Incident — SentinelCore" },
      { name: "description", content: "Submit a security incident to the SentinelCore response team." },
      { property: "og:title", content: "Report a Security Incident — SentinelCore" },
      { property: "og:description", content: "Submit a security incident." },
    ],
  }),
  component: Report,
});

const categories = ["Phishing", "Malware", "Data Breach", "Unauthorized Access", "DDoS", "Other"];
const severities: Severity[] = ["low", "medium", "high", "critical"];

function Report() {
  const [form, setForm] = useState({ email: "", category: "Phishing", description: "", severity: "medium" as Severity });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<ReportResult | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setDone(await api.report(form));
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <PageTitle icon={<Shield className="h-4 w-4" />} title="Report Incident" sub="Our response team triages every report. Critical incidents are escalated immediately." />
      <form onSubmit={submit} className="glass glow-border space-y-5 p-6">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-muted-foreground">Email</label>
          <input id="email" type="email" required maxLength={255} className="input-cyber" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="analyst@company.com" />
        </div>
        <div>
          <label htmlFor="cat" className="mb-1.5 block text-sm text-muted-foreground">Incident Category</label>
          <select id="cat" className="input-cyber" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => <option key={c} className="bg-background">{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="desc" className="mb-1.5 block text-sm text-muted-foreground">Description</label>
          <textarea id="desc" required minLength={10} maxLength={2000} rows={5} className="input-cyber" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What happened, when, and which systems are affected?" />
        </div>
        <fieldset>
          <legend className="mb-2 text-sm text-muted-foreground">Severity</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {severities.map((s) => (
              <label key={s} className={`cursor-pointer rounded-md border px-3 py-2 text-center font-mono text-sm capitalize transition ${form.severity === s ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                <input type="radio" name="sev" value={s} checked={form.severity === s} onChange={() => setForm({ ...form, severity: s })} className="sr-only" />
                {s}
              </label>
            ))}
          </div>
        </fieldset>
        <button className="btn-cyber w-full" disabled={busy}>{busy ? "Submitting…" : "Submit Incident"}</button>
      </form>

      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true">
          <div className="glass glow-border w-full max-w-sm p-6 text-center animate-in zoom-in-95">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-3 text-xl font-bold">Incident Submitted</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your ticket ID</p>
            <p className="mt-2 rounded-md border bg-background/60 py-2 font-mono text-lg text-primary">{done.ticketId}</p>
            {done.mock && <p className="mt-2 font-mono text-xs text-warning">// backend offline — local ticket ID</p>}
            <button className="btn-cyber mt-5 w-full" onClick={() => { setDone(null); setForm({ ...form, description: "" }); }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
