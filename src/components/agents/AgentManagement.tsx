import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { toast } from 'sonner';
import { api } from '@/components/compute/api';
import { Agent, AgentJob, RegisterAgentResponse, AgentStatus } from '@/types/agent';
import { Plus, Search, Server, RefreshCw, Loader2 } from 'lucide-react';
import { AgentCard } from './AgentCard';
import { AgentRegistrationModal } from './AgentRegistrationModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/ui/alert-dialog';

export function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [jobs, setJobs] = useState<Record<string, AgentJob[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);
  const [regenerateResult, setRegenerateResult] = useState<RegisterAgentResponse | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const data = await api.getAgents(statusFilter === 'all' ? undefined : statusFilter);
      setAgents(data);
      
      // Load jobs for each agent
      const jobsMap: Record<string, AgentJob[]> = {};
      for (const agent of data) {
        if (agent.active_jobs > 0) {
          const agentJobs = await api.getAgentJobs(agent.agent_id);
          jobsMap[agent.agent_id] = agentJobs;
        }
      }
      setJobs(jobsMap);
    } catch {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (agentId: string) => {
    try {
      const agent = await api.getAgentStats(agentId);
      setAgents(prev => prev.map(a => a.agent_id === agentId ? agent : a));
      
      if (agent.active_jobs > 0) {
        const agentJobs = await api.getAgentJobs(agentId);
        setJobs(prev => ({ ...prev, [agentId]: agentJobs }));
      }
      
      toast.success('Agent refreshed');
    } catch {
      toast.error('Failed to refresh agent');
    }
  };

  const handleDelete = async () => {
    if (!deleteAgentId) return;
    
    try {
      await api.deleteAgent(deleteAgentId);
      setAgents(prev => prev.filter(a => a.agent_id !== deleteAgentId));
      toast.success('Agent deleted');
    } catch {
      toast.error('Failed to delete agent');
    } finally {
      setDeleteAgentId(null);
    }
  };

  const handleRegenerateKey = async (agentId: string) => {
    try {
      const result = await api.regenerateAgentKey(agentId);
      setRegenerateResult(result);
      toast.success('API key regenerated');
    } catch {
      toast.error('Failed to regenerate key');
    }
  };

  const handleRegistrationSuccess = (response: RegisterAgentResponse) => {
    // Reload agents to get the new one
    loadAgents();
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.agent_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: agents.length,
    online: agents.filter(a => a.is_online).length,
    busy: agents.filter(a => a.status === 'busy').length,
    totalJobs: agents.reduce((acc, a) => acc + a.active_jobs, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">On-Premise Agents</h2>
          <p className="text-muted-foreground">
            Manage your connected training agents
          </p>
        </div>
        <Button onClick={() => setShowRegisterModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Register Agent
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Server className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.online}</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Busy</p>
                <p className="text-2xl font-bold text-amber-500">{stats.busy}</p>
              </div>
              <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AgentStatus | 'all')}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={loadAgents}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Agent List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAgents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No agents found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {agents.length === 0 
                ? 'Register your first agent to start training on your own hardware'
                : 'No agents match your search criteria'
              }
            </p>
            {agents.length === 0 && (
              <Button className="mt-4" onClick={() => setShowRegisterModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Register Agent
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAgents.map(agent => (
            <AgentCard
              key={agent.agent_id}
              agent={agent}
              jobs={jobs[agent.agent_id] || []}
              onDelete={setDeleteAgentId}
              onRegenerateKey={handleRegenerateKey}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AgentRegistrationModal
        open={showRegisterModal}
        onOpenChange={setShowRegisterModal}
        onSuccess={handleRegistrationSuccess}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteAgentId} onOpenChange={() => setDeleteAgentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
              All associated API keys will be revoked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate Key Result */}
      {regenerateResult && (
        <AlertDialog open={!!regenerateResult} onOpenChange={() => setRegenerateResult(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>New API Credentials</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Save these credentials - the secret key will not be shown again!
                  </p>
                  <div className="space-y-2 font-mono text-sm">
                    <p><strong>API Key:</strong> {regenerateResult.api_key}</p>
                    <p><strong>Secret Key:</strong> {regenerateResult.secret_key}</p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>I've saved these credentials</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}