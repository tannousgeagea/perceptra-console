import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { 
  Server, Cpu, HardDrive, Clock, Activity, ChevronDown, ChevronUp,
  RefreshCw, Trash2, Key, Terminal, CheckCircle2, XCircle, AlertCircle, Loader2
} from 'lucide-react';
import { Agent, AgentJob } from '@/types/agent';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  jobs: AgentJob[];
  onDelete: (agentId: string) => void;
  onRegenerateKey: (agentId: string) => void;
  onRefresh: (agentId: string) => void;
}

const statusConfig = {
  ready: { label: 'Ready', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  busy: { label: 'Busy', icon: Loader2, className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  offline: { label: 'Offline', icon: XCircle, className: 'bg-muted text-muted-foreground border-border' },
  error: { label: 'Error', icon: AlertCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  pending: { label: 'Pending', icon: Clock, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
};

export function AgentCard({ agent, jobs, onDelete, onRegenerateKey, onRefresh }: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  
  const statusInfo = statusConfig[agent.status];
  const StatusIcon = statusInfo.icon;

  const formatBytes = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              agent.is_online ? "bg-primary/10" : "bg-muted"
            )}>
              <Server className={cn("h-5 w-5", agent.is_online ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <CardTitle className="text-base">{agent.name}</CardTitle>
              <p className="text-xs text-muted-foreground font-mono">{agent.agent_id}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn("gap-1", statusInfo.className)}>
            <StatusIcon className={cn("h-3 w-3", agent.status === 'busy' && "animate-spin")} />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <span>{agent.gpu_count} GPU{agent.gpu_count !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span>{agent.active_jobs}/{agent.max_concurrent_jobs} jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Up {formatUptime(agent.uptime_seconds)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span>{agent.completed_jobs} done</span>
          </div>
        </div>

        {/* Last Heartbeat */}
        {agent.last_heartbeat && (
          <p className="text-xs text-muted-foreground">
            Last seen: {formatDistanceToNow(new Date(agent.last_heartbeat), { addSuffix: true })}
          </p>
        )}

        {/* Expandable Details */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between"
            onClick={() => setExpanded(!expanded)}
          >
            <span>System Details</span>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {expanded && (
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4 animate-in slide-in-from-top-2">
              {/* GPU Info */}
              {agent.gpu_info.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">GPUs</h4>
                  <div className="space-y-2">
                    {agent.gpu_info.map((gpu, idx) => (
                      <div key={gpu.uuid || idx} className="flex items-center justify-between rounded-md bg-background p-2 text-sm">
                        <span className="font-medium">{gpu.name}</span>
                        <span className="text-muted-foreground">
                          {formatBytes(gpu.memory_free)} / {formatBytes(gpu.memory_total)} free
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* System Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">System</h4>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div className="flex justify-between rounded-md bg-background p-2">
                    <span className="text-muted-foreground">OS</span>
                    <span>{agent.system_info.os}</span>
                  </div>
                  <div className="flex justify-between rounded-md bg-background p-2">
                    <span className="text-muted-foreground">CPUs</span>
                    <span>{agent.system_info.cpu_count}</span>
                  </div>
                  <div className="flex justify-between rounded-md bg-background p-2">
                    <span className="text-muted-foreground">Memory</span>
                    <span>{formatBytes(agent.system_info.memory_total)}</span>
                  </div>
                  <div className="flex justify-between rounded-md bg-background p-2">
                    <span className="text-muted-foreground">Python</span>
                    <span>{agent.system_info.python_version}</span>
                  </div>
                  {agent.system_info.cuda_version && (
                    <div className="flex justify-between rounded-md bg-background p-2">
                      <span className="text-muted-foreground">CUDA</span>
                      <span>{agent.system_info.cuda_version}</span>
                    </div>
                  )}
                  {agent.system_info.docker_version && (
                    <div className="flex justify-between rounded-md bg-background p-2">
                      <span className="text-muted-foreground">Docker</span>
                      <span>{agent.system_info.docker_version}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Jobs Section */}
        {jobs.length > 0 && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowJobs(!showJobs)}
            >
              <span>Active Jobs ({jobs.filter(j => j.status === 'running').length})</span>
              {showJobs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showJobs && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                {jobs.map(job => (
                  <div key={job.job_id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{job.task || 'Training'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{job.job_id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <div className="h-2 rounded-full bg-muted">
                          <div 
                            className="h-full rounded-full bg-primary transition-all" 
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-center text-xs text-muted-foreground">{job.progress.toFixed(0)}%</p>
                      </div>
                      <Badge variant={job.status === 'running' ? 'default' : job.status === 'completed' ? 'secondary' : 'destructive'}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onRefresh(agent.agent_id)}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => onRegenerateKey(agent.agent_id)}>
            <Key className="mr-1.5 h-3.5 w-3.5" />
            Regenerate Key
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(agent.agent_id)}
            disabled={agent.active_jobs > 0}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}