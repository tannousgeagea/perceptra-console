import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/ui/dialog';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { toast } from 'sonner';
import { useRegisterAgent } from '@/hooks/useAgents';
import { RegisterAgentResponse, GPUInfo, SystemInfo } from '@/types/agent';
import { Copy, Check, Terminal, Plus, Trash2, Loader2 } from 'lucide-react';

interface AgentRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (agent: RegisterAgentResponse) => void;
}

export function AgentRegistrationModal({ open, onOpenChange, onSuccess }: AgentRegistrationModalProps) {
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [gpus, setGpus] = useState<GPUInfo[]>([
    { name: '', memory_total: 0, memory_free: 0, uuid: '', cuda_compute_capability: '' }
  ]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    os: '',
    cpu_count: 0,
    memory_total: 0,
    python_version: '',
    cuda_version: '',
    docker_version: '',
  });
  
  const [result, setResult] = useState<RegisterAgentResponse | null>(null);
  const registerAgent = useRegisterAgent({
    onSuccess: (data) => {
      setResult(data);
      setStep('result');
      onSuccess(data);
    },
  });
  const handleAddGpu = () => {
    setGpus([...gpus, { name: '', memory_total: 0, memory_free: 0, uuid: '', cuda_compute_capability: '' }]);
  };

  const handleRemoveGpu = (index: number) => {
    setGpus(gpus.filter((_, i) => i !== index));
  };

  const handleGpuChange = (index: number, field: keyof GPUInfo, value: string | number) => {
    const updated = [...gpus];
    updated[index] = { ...updated[index], [field]: value };
    setGpus(updated);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error('Please provide an agent name');
      return;
    }

    setLoading(true);
    try {
      registerAgent.mutate({
        name: name.trim(),
        gpu_info: gpus.filter(g => g.name),
        system_info: systemInfo,
      });
      toast.success('Agent registered successfully');
    } catch {
      toast.error('Failed to register agent');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied to clipboard');
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('form');
      setName('');
      setGpus([{ name: '', memory_total: 0, memory_free: 0, uuid: '', cuda_compute_capability: '' }]);
      setSystemInfo({
        os: '',
        cpu_count: 0,
        memory_total: 0,
        python_version: '',
        cuda_version: '',
        docker_version: '',
      });
      setResult(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' ? 'Register New Agent' : 'Agent Registered Successfully'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' 
              ? 'Configure your on-premise agent to connect to the platform'
              : 'Save these credentials - the secret key will only be shown once!'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <div className="space-y-6 py-4">
            {/* Agent Name */}
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name *</Label>
              <Input
                id="agent-name"
                placeholder="e.g., GPU Workstation 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* GPU Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>GPU Information</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddGpu}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add GPU
                </Button>
              </div>
              
              {gpus.map((gpu, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">GPU {index + 1}</span>
                    {gpus.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveGpu(index)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="NVIDIA RTX 4090"
                        value={gpu.name}
                        onChange={(e) => handleGpuChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Memory (MB)</Label>
                      <Input
                        type="number"
                        placeholder="24576"
                        value={gpu.memory_total || ''}
                        onChange={(e) => handleGpuChange(index, 'memory_total', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Info */}
            <div className="space-y-3">
              <Label>System Information</Label>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Operating System</Label>
                  <Input
                    placeholder="Ubuntu 22.04"
                    value={systemInfo.os}
                    onChange={(e) => setSystemInfo({ ...systemInfo, os: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">CPU Count</Label>
                  <Input
                    type="number"
                    placeholder="16"
                    value={systemInfo.cpu_count || ''}
                    onChange={(e) => setSystemInfo({ ...systemInfo, cpu_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Memory (MB)</Label>
                  <Input
                    type="number"
                    placeholder="65536"
                    value={systemInfo.memory_total || ''}
                    onChange={(e) => setSystemInfo({ ...systemInfo, memory_total: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Python Version</Label>
                  <Input
                    placeholder="3.10.12"
                    value={systemInfo.python_version}
                    onChange={(e) => setSystemInfo({ ...systemInfo, python_version: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">CUDA Version</Label>
                  <Input
                    placeholder="12.1"
                    value={systemInfo.cuda_version || ''}
                    onChange={(e) => setSystemInfo({ ...systemInfo, cuda_version: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Docker Version</Label>
                  <Input
                    placeholder="24.0.5"
                    value={systemInfo.docker_version || ''}
                    onChange={(e) => setSystemInfo({ ...systemInfo, docker_version: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleRegister} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Agent
              </Button>
            </div>
          </div>
        ) : result && (
          <div className="space-y-6 py-4">
            {/* Credentials */}
            <div className="space-y-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                ⚠️ Save these credentials now - the secret key will not be shown again!
              </p>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Agent ID</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={result.agent_id} className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(result.agent_id, 'agent_id')}
                    >
                      {copied === 'agent_id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">API Key</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={result.api_key} className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(result.api_key, 'api_key')}
                    >
                      {copied === 'api_key' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Secret Key</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={result.secret_key} className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(result.secret_key, 'secret_key')}
                    >
                      {copied === 'secret_key' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Install Command */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Install Command
              </Label>
              <div className="relative">
                <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                  {result.install_command}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => handleCopy(result.install_command, 'install')}
                >
                  {copied === 'install' ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Run this command on your server to install and start the agent.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}