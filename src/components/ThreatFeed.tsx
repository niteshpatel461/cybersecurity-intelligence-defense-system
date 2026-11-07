import { useQuery } from "@tanstack/react-query";
import { Terminal } from "lucide-react";
import { api } from "@/services/api";
import { SeverityBadge, MockNote } from "./ui-bits";

export function ThreatFeed({ limit }: { limit?: number | undefined }) {
  const { data, isLoading } = useQuery({ queryKey: ["advisories"], queryFn: api.advisories });
  const items = data?.data.slice(0, limit) ?? [];
  return (
    <div className="glass glow-border p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold"><Terminal className="h-4 w-4 text-primary" /> Live Threat Feed</h2>
        <span className="flex items-center gap-2 font-mono text-xs text-primary"><span className="h-2 w-2 animate-pulse rounded-full bg-primary" />LIVE</span>
      </div>
      <div className="space-y-3 font-mono text-sm">
        {isLoading && <p className="text-muted-foreground">$ fetching advisories…</p>}
        {items.map((a) => (
          <div key={a.id} className="rounded-md border bg-background/60 p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>[{a.published}]</span><SeverityBadge level={a.severity} />
              {a.cve && <span className="text-secondary">{a.cve}</span>}
            </div>
            <p className="mt-1.5 font-sans font-medium text-foreground">{a.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">&gt; {a.summary}</p>
          </div>
        ))}
      </div>
      <MockNote show={data?.mock} />
    </div>
  );
}
