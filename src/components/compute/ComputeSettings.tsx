import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Slider } from '@/components/ui/ui/slider';
import { Switch } from '@/components/ui/ui/switch';
import { toast } from 'sonner';
import { api } from './api';
import { ComputeProvider, ComputeStrategy, ComputeCredentials, CredentialField } from '@/types/compute';
import { Cpu, Cloud, Server, Zap, CheckCircle2, XCircle, Loader2, Eye, EyeOff, Key } from 'lucide-react';
import { ComputeProfileCard } from './ComputeProfileCard';
import { 
  useComputeProfiles, 
  useComputeProviders,
  useCreateComputeProfile,
  useUpdateComputeProfile,
  useDeleteComputeProfile,
} from '@/hooks/useCompute';


const strategyOptions: { value: ComputeStrategy; label: string; description: string }[] = [
  { value: 'cheapest', label: 'Cheapest Available', description: 'Minimize cost per training run' },
  { value: 'fastest', label: 'Fastest (Best GPU)', description: 'Use the most powerful available instance' },
  { value: 'preferred', label: 'Preferred Provider', description: 'Always use the selected provider' },
  { value: 'queue', label: 'Queue on Platform GPUs', description: 'Wait for platform resources' },
];

export function ComputeSettings() {
  const [selectedProvider, setSelectedProvider] = useState<ComputeProvider | null>(null);
  const [testing, setTesting] = useState(false);  
  const [formData, setFormData] = useState({
    name: '',
    instance_type: '',
    strategy: 'queue' as ComputeStrategy,
    max_concurrent_jobs: 5,
    max_cost_per_hour: 10,
    max_training_hours: 24,
    is_default: false,
  });

  const [credentials, setCredentials] = useState<Partial<ComputeCredentials>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { data: providers = [], isLoading: loadingProviders } = useComputeProviders();
  const { data: profiles = [], isLoading: loadingProfiles } = useComputeProfiles();
  const createProfile = useCreateComputeProfile({
    onSuccess: (newProfile) => {
      setFormData({
        name: '',
        instance_type: selectedProvider?.available_instances[0]?.name || '',
        strategy: 'queue',
        max_concurrent_jobs: 5,
        max_cost_per_hour: 10,
        max_training_hours: 24,
        is_default: false,
      });
      setCredentials({});
      setShowSecrets({});
    },
  });

  const updateComputeProfileMutation = useUpdateComputeProfile({
    showToast: true, // optional, defaults to true
  });

  const deleteComputeProfileMutation = useDeleteComputeProfile({
    showToast: true, // optional
  });

  useEffect(() => {
    if (providers.length > 0) {
      setSelectedProvider(providers[0]);
      if (providers[0].available_instances.length > 0) {
        setFormData(prev => ({
          ...prev,
          instance_type: providers[0].available_instances[0].name,
        }));
      }
    }
  }, [providers]);

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === Number(providerId));
    setSelectedProvider(provider || null);
    setCredentials({});
    setShowSecrets({});
    if (provider?.available_instances.length) {
      setFormData(prev => ({
        ...prev,
        instance_type: provider.available_instances[0].name,
      }));
    }
  };

  const getCredentialFields = (providerType: string): CredentialField[] => {
    if (providerType.includes('aws')) {
      return [
        { key: 'aws_access_key_id', label: 'AWS Access Key ID', secret: false },
        { key: 'aws_secret_access_key', label: 'AWS Secret Access Key', secret: true },
        { key: 'aws_region', label: 'AWS Region', secret: false, placeholder: 'us-east-1' },
      ];
    }
    if (providerType.includes('gcp')) {
      return [
        { key: 'gcp_project_id', label: 'GCP Project ID', secret: false },
        { key: 'gcp_service_account_json', label: 'Service Account JSON', secret: true, multiline: true },
      ];
    }
    if (providerType.includes('azure')) {
      return [
        { key: 'azure_subscription_id', label: 'Subscription ID', secret: false },
        { key: 'azure_tenant_id', label: 'Tenant ID', secret: false },
        { key: 'azure_client_id', label: 'Client ID', secret: false },
        { key: 'azure_client_secret', label: 'Client Secret', secret: true },
      ];
    }
    if (providerType.includes('runpod')) {
      return [
        { key: 'runpod_api_key', label: 'RunPod API Key', secret: true },
      ];
    }
    if (providerType.includes('lambda')) {
      return [
        { key: 'lambda_api_key', label: 'Lambda Labs API Key', secret: true },
      ];
    }
    return [];
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestConnection = async () => {
    if (!selectedProvider) return;
    setTesting(true);
    try {
      const result = await api.testComputeConnection(selectedProvider.id);
      if (result.success) {
        toast.success(result.message, { icon: <CheckCircle2 className="h-4 w-4" /> });
      } else {
        toast.error(result.message, { icon: <XCircle className="h-4 w-4" /> });
      }
    } catch {
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveProfile = () => {
    if (!selectedProvider || !formData.name) {
      toast.error('Please provide a profile name');
      return;
    }
    
    const credentialFields = getCredentialFields(selectedProvider.provider_type);
    if (selectedProvider.requires_user_credentials && credentialFields.length > 0) {
      const missingFields = credentialFields.filter(f => !credentials[f.key as keyof ComputeCredentials]);
      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.map(f => f.label).join(', ')}`);
        return;
      }
    }
    
    createProfile.mutate({
      name: formData.name,
      provider_id: selectedProvider.id,
      default_instance_type: formData.instance_type,
      strategy: formData.strategy,
      max_concurrent_jobs: formData.max_concurrent_jobs,
      max_cost_per_hour: formData.max_cost_per_hour,
      max_training_hours: formData.max_training_hours,
      is_default: formData.is_default,
      user_credentials: selectedProvider.requires_user_credentials ? credentials as ComputeCredentials : undefined,
    });
  };

  const handleDeleteProfile = async (id: string) => {
    deleteComputeProfileMutation.mutate(id);
  };

  const handleSetDefault = async (id: string) => {
    updateComputeProfileMutation.mutate({
      profileId: id,
      request: { is_default: true },
    });
  };

  const handleCredentialsUpdate = (id: string, hasCredentials: boolean) => {
    // setProfiles(profiles.map(p => 
    //   p.id === id ? { ...p, has_credentials: hasCredentials } : p
    // ));

    console.log("Credential: ", id, hasCredentials)
  };

  if (loadingProfiles || loadingProviders) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const loading = createProfile.isPending
  const selectedInstance = selectedProvider?.available_instances.find(
    i => i.name === formData.instance_type
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Compute Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure computing platforms for training your ML models
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Compute Profile</CardTitle>
          <CardDescription>
            Select a compute provider and configure training resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Profile Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Production Training"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Compute Provider *</Label>
            <Select
              value={selectedProvider?.id.toString() || ''}
              onValueChange={handleProviderChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id.toString()}>
                    <div className="flex items-center gap-2">
                      {provider.provider_type.includes('gpu') ? (
                        <Zap className="h-4 w-4 text-amber-500" />
                      ) : provider.provider_type.includes('aws') || provider.provider_type.includes('gcp') || provider.provider_type.includes('azure') ? (
                        <Cloud className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Server className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{provider.name}</span>
                      {provider.requires_user_credentials && (
                        <span className="text-xs text-muted-foreground">(credentials required)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProvider && (
              <p className="text-sm text-muted-foreground">{selectedProvider.description}</p>
            )}
          </div>

          {selectedProvider && selectedProvider.available_instances.length > 1 && (
            <div className="space-y-2">
              <Label>Instance Type *</Label>
              <Select
                value={formData.instance_type}
                onValueChange={(v) => setFormData({ ...formData, instance_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider.available_instances.map((instance) => (
                    <SelectItem key={instance.name} value={instance.name}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{instance.name}</span>
                        <span className="text-muted-foreground">
                          {instance.vcpus} vCPUs, {instance.memory_gb}GB
                          {instance.gpu_type && `, ${instance.gpu_count}x ${instance.gpu_type}`}
                        </span>
                        {instance.cost_per_hour && (
                          <span className="text-primary">${instance.cost_per_hour}/hr</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedInstance && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    <div>
                      <span className="text-muted-foreground">vCPUs:</span> {selectedInstance.vcpus}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Memory:</span> {selectedInstance.memory_gb}GB
                    </div>
                    {selectedInstance.gpu_type && (
                      <div>
                        <span className="text-muted-foreground">GPU:</span> {selectedInstance.gpu_count}x {selectedInstance.gpu_type}
                      </div>
                    )}
                    {selectedInstance.cost_per_hour && (
                      <div>
                        <span className="text-muted-foreground">Cost:</span> ${selectedInstance.cost_per_hour}/hr
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Training Strategy</Label>
            <Select
              value={formData.strategy}
              onValueChange={(v) => setFormData({ ...formData, strategy: v as ComputeStrategy })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {strategyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <span className="font-medium">{option.label}</span>
                      <span className="ml-2 text-muted-foreground text-xs">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Label>Max Concurrent Jobs: {formData.max_concurrent_jobs}</Label>
              <Slider
                value={[formData.max_concurrent_jobs]}
                onValueChange={([v]) => setFormData({ ...formData, max_concurrent_jobs: v })}
                min={1}
                max={50}
                step={1}
              />
            </div>
            <div className="space-y-4">
              <Label>Max Training Hours: {formData.max_training_hours}h</Label>
              <Slider
                value={[formData.max_training_hours]}
                onValueChange={([v]) => setFormData({ ...formData, max_training_hours: v })}
                min={1}
                max={168}
                step={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max Cost Per Hour: ${formData.max_cost_per_hour}</Label>
            <Slider
              value={[formData.max_cost_per_hour]}
              onValueChange={([v]) => setFormData({ ...formData, max_cost_per_hour: v })}
              min={1}
              max={100}
              step={1}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(v) => setFormData({ ...formData, is_default: v })}
            />
            <Label htmlFor="is_default">Set as default profile</Label>
          </div>


          {selectedProvider?.requires_user_credentials && (
            <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <Label className="text-base font-medium">Provider Credentials</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your {selectedProvider.name} credentials to enable training on this platform
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {getCredentialFields(selectedProvider.provider_type).map((field) => (
                  <div key={field.key} className={field.multiline ? 'md:col-span-2' : ''}>
                    <Label htmlFor={field.key}>{field.label} *</Label>
                    <div className="relative mt-1">
                      {field.multiline ? (
                        <textarea
                          id={field.key}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          value={(credentials[field.key as keyof ComputeCredentials] as string) || ''}
                          onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                        />
                      ) : (
                        <>
                          <Input
                            id={field.key}
                            type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                            placeholder={field.placeholder || `Enter ${field.label}`}
                            value={(credentials[field.key as keyof ComputeCredentials] as string) || ''}
                            onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                            className={field.secret ? 'pr-10' : ''}
                          />
                          {field.secret && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => toggleSecretVisibility(field.key)}
                            >
                              {showSecrets[field.key] ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {selectedProvider?.requires_user_credentials && (
              <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
            )}
            <Button onClick={handleSaveProfile} disabled={loading || !formData.name}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Existing Compute Profiles</h3>
        {profiles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Cpu className="mx-auto h-12 w-12 mb-3 opacity-50" />
              No compute profiles configured yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {profiles.map((profile) => (
              <ComputeProfileCard
                key={profile.id}
                profile={profile}
                onDelete={handleDeleteProfile}
                onSetDefault={handleSetDefault}
                onCredentialsUpdate={handleCredentialsUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
