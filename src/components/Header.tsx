import { Link } from "@tanstack/react-router";
import { Menu, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/password-auditor", label: "Password Auditor" },
  { to: "/threat-scanner", label: "Threat Scanner" },
  { to: "/advisories", label: "Advisories" },
  { to: "/report", label: "Report Incident" },
] as const;

function Status() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    const ping = () => api.health().then((v) => alive && setOk(v));
    ping();
    const id = setInterval(ping, 15000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  const tone = ok === null ? "text-muted-foreground" : ok ? "text-primary" : "text-warning";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs ${tone}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {ok === null ? "Checking…" : ok ? "API Online" : "Offline · Mock"}
    </span>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-primary/40 animate-pulse-ring" />
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-primary/50 bg-background glow-primary">
              <Shield className="h-5 w-5 text-primary" />
            </span>
          </span>
          <span className="text-lg font-bold tracking-tight">Sentinel<span className="text-gradient">Core</span></span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: true }}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary bg-primary/10" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block"><Status /></div>
          <button aria-label="Open menu" className="lg:hidden rounded-md border p-2" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-in fade-in" onClick={() => setOpen(false)} />
          <aside className="glass absolute right-0 top-0 flex h-full w-72 flex-col gap-2 rounded-none p-5 animate-in slide-in-from-right">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold">Navigation</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
                className="rounded-md px-3 py-2.5 text-muted-foreground hover:bg-muted"
                activeProps={{ className: "text-primary bg-primary/10" }}>
                {l.label}
              </Link>
            ))}
            <div className="mt-auto"><Status /></div>
          </aside>
        </div>
      )}
    </header>
  );
}
