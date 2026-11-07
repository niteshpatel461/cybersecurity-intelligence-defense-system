import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { ThreatFeed } from "@/components/ThreatFeed";
import { PageTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/advisories")({
  head: () => ({
    meta: [
      { title: "Security Advisories — SentinelCore" },
      { name: "description", content: "Latest CVEs and threat advisories tracked by SentinelCore." },
      { property: "og:title", content: "Security Advisories — SentinelCore" },
      { property: "og:description", content: "Latest CVEs and threat advisories." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageTitle icon={<AlertTriangle className="h-4 w-4" />} title="Security Advisories" sub="Curated vulnerability and campaign intelligence, refreshed from the SentinelCore backend." />
      <ThreatFeed />
    </div>
  ),
});
