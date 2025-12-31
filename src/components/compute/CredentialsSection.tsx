import { useState } from 'react';
import { ChevronDown, ChevronUp, Key, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Textarea } from '@/components/ui/ui/textarea';
import { Badge } from '@/components/ui/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/ui/collapsible';
import { ComputeProviderType } from '@/types/compute';

interface CredentialsSectionProps {
  providerType: ComputeProviderType;
  hasCredentials: boolean;
  onSave: (credentials: Record<string, string>) => Promise<void>;
}

interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'textarea';
  placeholder: string;
  required: boolean;
}

const credentialFields: Record<string, CredentialField[]> = {
  'aws-sagemaker': [
    { key: 'access_key_id', label: 'Access Key ID', type: 'text', placeholder: 'AKIA...', required: true },
    { key: 'secret_access_key', label: 'Secret Access Key', type: 'password', placeholder: '••••••••', required: true },
    { key: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1', required: true },
    { key: 'role_arn', label: 'Role ARN (optional)', type: 'text', placeholder: 'arn:aws:iam::...', required: false },
  ],
  'gcp-vertex': [
    { key: 'project_id', label: 'Project ID', type: 'text', placeholder: 'my-project-123', required: true },
    { key: 'service_account_json', label: 'Service Account JSON', type: 'textarea', placeholder: '{ "type": "service_account", ... }', required: true },
    { key: 'region', label: 'Region', type: 'text', placeholder: 'us-central1', required: true },
  ],
  'azure-ml': [
    { key: 'subscription_id', label: 'Subscription ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true },
    { key: 'tenant_id', label: 'Tenant ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true },
    { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true },
    { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: '••••••••', required: true },
    { key: 'resource_group', label: 'Resource Group', type: 'text', placeholder: 'my-resource-group', required: true },
  ],
  'runpod': [
    { key: 'api_key', label: 'API Key', type: 'password', placeholder: '••••••••', required: true },
  ],
  'modal': [
    { key: 'token_id', label: 'Token ID', type: 'text', placeholder: 'ak-...', required: true },
    { key: 'token_secret', label: 'Token Secret', type: 'password', placeholder: '••••••••', required: true },
  ],
  'kubernetes': [
    { key: 'kubeconfig', label: 'Kubeconfig', type: 'textarea', placeholder: 'apiVersion: v1\nkind: Config\n...', required: true },
    { key: 'namespace', label: 'Namespace (optional)', type: 'text', placeholder: 'default', required: false },
  ],
  'on-premise-agent': [
    { key: 'agent_token', label: 'Agent Token', type: 'password', placeholder: '••••••••', required: true },
    { key: 'endpoint_url', label: 'Agent Endpoint URL', type: 'text', placeholder: 'https://agent.mycompany.com', required: true },
  ],
};

export function CredentialsSection({ providerType, hasCredentials, onSave }: CredentialsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fields = credentialFields[providerType];

  // If provider doesn't require credentials, don't render anything
  if (!fields) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(values);
      setValues({});
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const requiredFields = fields.filter(f => f.required);
  const isValid = requiredFields.every(f => values[f.key]?.trim());

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4 border-t pt-4">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Credentials</span>
            {hasCredentials ? (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                <Check className="mr-1 h-3 w-3" />
                Configured
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                <AlertCircle className="mr-1 h-3 w-3" />
                Required
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4 space-y-4">
        {hasCredentials && (
          <p className="text-xs text-muted-foreground">
            Credentials are already configured. Enter new values below to update them.
          </p>
        )}

        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={field.key} className="text-xs">
              {field.label}
              {field.required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {field.type === 'textarea' ? (
              <Textarea
                id={field.key}
                placeholder={field.placeholder}
                value={values[field.key] || ''}
                onChange={(e) => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="font-mono text-xs min-h-[80px]"
              />
            ) : (
              <div className="relative">
                <Input
                  id={field.key}
                  type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  value={values[field.key] || ''}
                  onChange={(e) => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="font-mono text-xs pr-10"
                />
                {field.type === 'password' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility(field.key)}
                  >
                    {showPasswords[field.key] ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isValid || isSaving}
          >
            {isSaving ? 'Saving...' : hasCredentials ? 'Update Credentials' : 'Save Credentials'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setValues({});
            }}
          >
            Cancel
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}