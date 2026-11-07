import type { ReactNode } from "react";
import type { Severity } from "@/services/api";

const sevClass: Record<Severity, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/40",
  high: "bg-warning/15 text-warning border-warning/40",
  medium: "bg-secondary/15 text-secondary border-secondary/40",
  low: "bg-primary/10 text-primary border-primary/30",
};

export function SeverityBadge({ level }: { level: Severity }) {
  return (
    <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${sevClass[level]}`}>
      {level}
    </span>
  );
}

export function PageTitle({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-secondary">
        {icon} SentinelCore Module
      </div>
      <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{sub}</p>
    </div>
  );
}

export function MockNote({ show }: { show?: boolean | undefined }) {
  if (!show) return null;
  return <p className="mt-3 font-mono text-xs text-warning">// backend offline — showing local fallback result</p>;
}
