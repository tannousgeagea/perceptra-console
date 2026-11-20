// Which version ran where, from when to when, who put it there and how it ended.
import { History, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { cn } from "@/lib/utils";
import { useDeploymentHistory, type DeploymentEntry } from "@/hooks/useMonitoringLoop";

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

function duration(from: string, to: string | null): string {
  const ms = (to ? new Date(to) : new Date()).getTime() - new Date(from).getTime();
  const hours = ms / 3_600_000;
  if (hours < 1) return "under an hour";
  if (hours < 48) return `${Math.round(hours)} h`;
  return `${Math.round(hours / 24)} days`;
}

function ending(d: DeploymentEntry): string {
  switch (d.ended_by) {
    case "moved_to_production": return "Promoted to production";
    case "moved_to_staging": return "Moved to staging";
    case "replaced": return `Replaced by ${d.replaced_by_version}`;
    case "undeployed": return "Undeployed";
    default: return "";
  }
}

export function DeploymentHistory({ modelId }: { modelId: string }) {
  const { data, isLoading, error } = useDeploymentHistory(modelId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" aria-hidden /> History
        </CardTitle>
        <CardDescription>Every deployment of this model, newest first.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" /> Loading history…
          </p>
        ) : error ? (
          <p className="text-sm text-destructive">Couldn't load history: {error instanceof Error ? error.message : ""}</p>
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground">No version of this model has been deployed yet.</p>
        ) : (
          <ol className="relative space-y-5 border-l pl-6">
            {data.map((d) => (
              <li key={d.id} className="relative">
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-background",
                    d.is_active
                      ? d.target_env === "production" ? "bg-emerald-500" : "bg-blue-500"
                      : "bg-muted-foreground/40",
                  )}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{d.version_name}</span>
                  <Badge variant="outline" className="capitalize">{d.target_env}</Badge>
                  {d.is_active && <Badge className="bg-emerald-600 hover:bg-emerald-600">Live</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {when(d.deployed_at)}
                  {d.deployed_by ? ` by ${d.deployed_by}` : ""}
                  {" · "}
                  {d.is_active ? `running for ${duration(d.deployed_at, null)}` : `ran ${duration(d.deployed_at, d.undeployed_at)}`}
                </p>
                {!d.is_active && d.undeployed_at && (
                  <p className="text-sm text-muted-foreground">
                    {ending(d)} on {when(d.undeployed_at)}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
