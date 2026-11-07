import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { api, localPasswordAudit, type PasswordResult } from "@/services/api";
import { MockNote, PageTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/password-auditor")({
  head: () => ({
    meta: [
      { title: "Password Entropy Auditor — SentinelCore" },
      { name: "description", content: "Measure password entropy and strength with actionable recommendations." },
      { property: "og:title", content: "Password Entropy Auditor — SentinelCore" },
      { property: "og:description", content: "Measure password entropy and strength." },
    ],
  }),
  component: Auditor,
});

function Auditor() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [res, setRes] = useState<PasswordResult | null>(null);
  const live = localPasswordAudit(pw);
  const score = res?.score ?? live.score;

  useEffect(() => {
    if (!pw) { setRes(null); return; }
    const t = setTimeout(() => api.checkPassword(pw).then(setRes), 400);
    return () => clearTimeout(t);
  }, [pw]);

  const tone = score < 40 ? "bg-destructive" : score < 70 ? "bg-warning" : "bg-success";
  const label = score < 40 ? "Weak" : score < 70 ? "Moderate" : "Strong";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageTitle icon={<Lock className="h-4 w-4" />} title="Password Entropy & Strength Auditor" sub="Passwords are analysed for entropy and common weaknesses. Never paste production credentials into untrusted tools." />
      <div className="glass glow-border p-6">
        <label className="mb-2 block text-sm text-muted-foreground" htmlFor="pw">Password</label>
        <div className="relative">
          <input id="pw" type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} className="input-cyber pr-11" placeholder="Enter a password to audit" autoComplete="off" />
          <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-6 flex items-center justify-between font-mono text-sm">
          <span>Strength: <span className="font-bold">{pw ? label : "—"}</span></span>
          <span>{score}% · {res?.entropy ?? live.entropy} bits</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full transition-all duration-500 ${tone}`} style={{ width: `${score}%` }} />
        </div>
        {pw && (
          <div className="mt-6 rounded-md border bg-background/60 p-4 font-mono text-sm">
            <p className="mb-2 text-secondary">$ recommendations</p>
            <ul className="space-y-1.5">
              {(res?.recommendations ?? live.recommendations).map((r) => <li key={r} className="text-muted-foreground">&gt; {r}</li>)}
            </ul>
          </div>
        )}
        <MockNote show={res?.mock} />
      </div>
    </div>
  );
}
