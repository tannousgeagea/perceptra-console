import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Textarea } from '@/components/ui/ui/textarea';
import { Credentials, StorageBackend } from '@/types/storage';

/** Form state of the credential fields (shared by profile creation and credential rotation). */
export type CredentialForm = Record<string, string>;

export const AZURE_AUTH_METHODS = [
  { value: 'account_key', label: 'Account key' },
  { value: 'connection_string', label: 'Connection string' },
  { value: 'service_principal', label: 'Service principal (short-lived URLs)' },
  { value: 'sas_token', label: 'SAS token (served through Perceptra proxy)' },
];

export function buildCredentials(backend: StorageBackend, form: CredentialForm): Credentials {
  switch (backend) {
    case 'azure':
      switch (form.azureAuth || 'account_key') {
        case 'connection_string':
          return { type: 'connection_string', connection_string: form.connectionString };
        case 'service_principal':
          return {
            type: 'service_principal',
            tenant_id: form.tenantId,
            client_id: form.clientId,
            client_secret: form.clientSecret,
          };
        case 'sas_token':
          return { type: 'sas_token', sas_token: (form.sasToken || '').replace(/^\?/, '') };
        default:
          return { type: 'account_key', account_key: form.accountKey };
      }

    case 's3':
    case 'minio':
      return {
        type: 'access_key',
        access_key_id: form.accessKey,
        secret_access_key: form.secretKey,
        ...(form.sessionToken ? { session_token: form.sessionToken } : {}),
      };

    case 'gcs':
      return { type: 'gcs_service_account', service_account_info: form.serviceAccountJson };

    case 'local':
      return { type: 'connection_string', connection_string: '' }; // Local doesn't need credentials

    default:
      throw new Error('Unsupported backend');
  }
}

interface CredentialFieldsProps {
  backend: StorageBackend;
  form: CredentialForm;
  onChange: (field: string, value: string) => void;
}

/** The secret part of a storage profile: rendered on create and in the rotate dialog. */
export function CredentialFields({ backend, form, onChange }: CredentialFieldsProps) {
  const field = (id: string, label: string, placeholder: string, secret = false) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={secret ? 'password' : 'text'}
        autoComplete="off"
        placeholder={placeholder}
        value={form[id] || ''}
        onChange={(e) => onChange(id, e.target.value)}
      />
    </div>
  );

  switch (backend) {
    case 'azure': {
      const method = form.azureAuth || 'account_key';
      return (
        <>
          <div className="space-y-2">
            <Label>Authentication</Label>
            <Select value={method} onValueChange={(v) => onChange('azureAuth', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AZURE_AUTH_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {method === 'account_key' && field('accountKey', 'Account Key *', 'Enter account key', true)}
          {method === 'connection_string' && (
            <div className="space-y-2">
              <Label htmlFor="connectionString">Connection String *</Label>
              <Textarea
                id="connectionString"
                placeholder="DefaultEndpointsProtocol=https;AccountName=..."
                value={form.connectionString || ''}
                onChange={(e) => onChange('connectionString', e.target.value)}
                rows={3}
              />
            </div>
          )}
          {method === 'service_principal' && (
            <>
              {field('tenantId', 'Tenant ID *', '00000000-0000-0000-0000-000000000000')}
              {field('clientId', 'Client ID *', '00000000-0000-0000-0000-000000000000')}
              {field('clientSecret', 'Client Secret *', 'Enter client secret', true)}
              <p className="text-sm text-muted-foreground">
                Needs the "Storage Blob Data Reader" and "Storage Blob Delegator" roles on the account.
              </p>
            </>
          )}
          {method === 'sas_token' && (
            <>
              {field('sasToken', 'SAS Token *', 'sv=...&sp=rl&sig=...', true)}
              <p className="text-sm text-muted-foreground">
                A read-only container SAS (sp=r, sr=c) is enough for external storage; list (l) is optional. Images
                are streamed through Perceptra so the token never reaches the browser.
              </p>
            </>
          )}
        </>
      );
    }

    case 's3':
    case 'minio':
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            {field('accessKey', backend === 's3' ? 'Access Key ID *' : 'Access Key *', backend === 's3' ? 'AKIA...' : 'minioadmin')}
            {field('secretKey', backend === 's3' ? 'Secret Access Key *' : 'Secret Key *', 'Enter secret key', true)}
          </div>
          {backend === 's3' && field('sessionToken', 'Session Token (optional, temporary credentials)', 'IQoJb3JpZ2lu...', true)}
        </>
      );

    case 'gcs':
      return (
        <div className="space-y-2">
          <Label htmlFor="serviceAccountJson">Service Account Key (JSON) *</Label>
          <Textarea
            id="serviceAccountJson"
            placeholder='{"type": "service_account", "project_id": "...", ...}'
            value={form.serviceAccountJson || ''}
            onChange={(e) => onChange('serviceAccountJson', e.target.value)}
            rows={5}
          />
          <p className="text-sm text-muted-foreground">Read access (Storage Object Viewer) is enough for external storage.</p>
        </div>
      );

    default:
      return null;
  }
}
