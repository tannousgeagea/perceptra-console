import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Textarea } from '@/components/ui/ui/textarea';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { useTestStorageConnection, useCreateStorageProfile, useStorageProfiles } from '@/hooks/useStorage';
import { StorageBackend, Credentials } from '@/types/storage';
import { Database, Cloud, Server, HardDrive, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { StorageProfileCard } from './StorageProfileCard';

const storageOptions = [
  { value: 'azure', label: 'Azure Blob Storage', icon: Cloud },
  { value: 's3', label: 'Amazon S3', icon: Database },
  { value: 'minio', label: 'MinIO / S3-Compatible', icon: Server },
  { value: 'local', label: 'Local Storage', icon: HardDrive },
];

export function StorageSettings() {
  const [selectedBackend, setSelectedBackend] = useState<StorageBackend>('azure');
  
  // ✅ Use hooks
  const { mutate: testConnection, isPending: isTesting } = useTestStorageConnection();
  const { mutate: createProfile, isPending: isCreating } = useCreateStorageProfile();
  const { data, isLoading } = useStorageProfiles();
  const profiles = data?.profiles || [];

  const [formData, setFormData] = useState<any>({});
  
  // ✅ Build credentials based on backend
  const buildCredentials = (): Credentials => {
    switch (selectedBackend) {
      case 'azure':
        if (formData.connectionString) {
          return {
            type: 'connection_string',
            connection_string: formData.connectionString,
          };
        }
        return {
          type: 'account_key',
          account_key: formData.accountKey,
        };

      case 's3':
      case 'minio':
        return {
          type: 'access_key',
          access_key_id: formData.accessKey,
          secret_access_key: formData.secretKey,
        };

      case 'local':
        return { type: 'connection_string', connection_string: '' }; // Local doesn't need credentials

      default:
        throw new Error('Unsupported backend');
    }
  };

  // ✅ Build config based on backend
  const buildConfig = () => {
    const config: any = {};

    switch (selectedBackend) {
      case 'azure':
        config.container_name = formData.containerName;
        config.account_name = formData.accountName;
        break;

      case 's3':
        config.bucket_name = formData.bucketName;
        if (formData.kmsKeyId) config.kms_key_id = formData.kmsKeyId;
        break;

      case 'minio':
        config.bucket_name = formData.bucketName;
        config.endpoint_url = formData.endpointUrl;
        break;

      case 'local':
        config.base_path = formData.basePath;
        break;
    }

    if (formData.basePath) config.base_path_prefix = formData.basePath;
    return config;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  // ✅ Test connection handler
  const handleTestConnection = () => {
    testConnection({
      profile: {
        name: formData.name || `${selectedBackend} Storage`,
        backend: selectedBackend,
        region: formData.region,
        config: buildConfig(),
      },
      credentials: buildCredentials(),
    }, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(result.message, { icon: <CheckCircle2 className="h-4 w-4" /> });
        } else {
          toast.error(result.error || result.message, { icon: <XCircle className="h-4 w-4" /> });
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  // ✅ Create profile handler
  const handleSaveConfiguration = () => {
    createProfile({
      profile: {
        name: formData.name || `${selectedBackend} Storage`,
        backend: selectedBackend,
        region: formData.region,
        is_default: formData.is_default || false,
        config: buildConfig(),
      },
      credentials: buildCredentials(),
      test_before_save: true,
    }, {
      onSuccess: () => {
        setFormData({}); // Clear form
      },
    });
  };

  const renderBackendFields = () => {
    switch (selectedBackend) {
      case 'azure':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="containerName">Container Name *</Label>
              <Input
                id="containerName"
                placeholder="my-container"
                value={formData.containerName || ''}
                onChange={(e) => handleInputChange('containerName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name *</Label> 
              <Input
                id="accountName"
                placeholder="mystorageaccount"
                value={formData.accountName || ''}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="connectionString">Connection String</Label>
              <Textarea
                id="connectionString"
                placeholder="DefaultEndpointsProtocol=https;AccountName=..."
                value={formData.connectionString || ''}
                onChange={(e) => handleInputChange('connectionString', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountKey">Account Key (alternative)</Label>
              <Input
                id="accountKey"
                type="password"
                placeholder="Enter account key"
                value={formData.accountKey || ''}
                onChange={(e) => handleInputChange('accountKey', e.target.value)}
              />
            </div>
          </>
        );
      
      case 's3':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="bucketName">Bucket Name *</Label>
              <Input
                id="bucketName"
                placeholder="my-bucket"
                value={formData.bucketName || ''}
                onChange={(e) => handleInputChange('bucketName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accessKey">Access Key ID *</Label>
                <Input
                  id="accessKey"
                  placeholder="AKIA..."
                  value={formData.accessKey || ''}
                  onChange={(e) => handleInputChange('accessKey', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Access Key *</Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="Enter secret key"
                  value={formData.secretKey || ''}
                  onChange={(e) => handleInputChange('secretKey', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                placeholder="us-east-1"
                value={formData.region || ''}
                onChange={(e) => handleInputChange('region', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kmsKeyId">KMS Key ID (optional)</Label>
              <Input
                id="kmsKeyId"
                placeholder="arn:aws:kms:..."
                value={formData.kmsKeyId || ''}
                onChange={(e) => handleInputChange('kmsKeyId', e.target.value)}
              />
            </div>
          </>
        );
      
      case 'minio':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="endpointUrl">Endpoint URL *</Label>
              <Input
                id="endpointUrl"
                placeholder="https://minio.example.com:9000"
                value={formData.endpointUrl || ''}
                onChange={(e) => handleInputChange('endpointUrl', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bucketName">Bucket Name *</Label>
              <Input
                id="bucketName"
                placeholder="my-bucket"
                value={formData.bucketName || ''}
                onChange={(e) => handleInputChange('bucketName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accessKey">Access Key *</Label>
                <Input
                  id="accessKey"
                  placeholder="minioadmin"
                  value={formData.accessKey || ''}
                  onChange={(e) => handleInputChange('accessKey', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key *</Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="Enter secret key"
                  value={formData.secretKey || ''}
                  onChange={(e) => handleInputChange('secretKey', e.target.value)}
                />
              </div>
            </div>
          </>
        );
      
      case 'local':
        return (
          <div className="space-y-2">
            <Label htmlFor="basePath">Base Path *</Label>
            <Input
              id="basePath"
              placeholder="/mnt/storage/cv-data"
              value={formData.basePath || ''}
              onChange={(e) => handleInputChange('basePath', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Absolute path to the directory where files will be stored
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Storage Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure where your organization's data will be stored
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Storage Configuration</CardTitle>
          <CardDescription>
            Choose a storage backend and configure the connection settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="backend">Storage Backend *</Label>
            <Select value={selectedBackend} onValueChange={(v) => setSelectedBackend(v as StorageBackend)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {storageOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Profile Name *</Label>
            <Input
              id="name"
              placeholder="Production Storage"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          {renderBackendFields()}

          <div className="space-y-2">
            <Label htmlFor="basePath">Base Path Prefix (optional)</Label>
            <Input
              id="basePath"
              placeholder="/datasets"
              value={formData.basePath || ''}
              onChange={(e) => handleInputChange('basePath', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this storage configuration"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default || false}
              onCheckedChange={(checked) => handleInputChange('is_default', checked)}
            />
            <Label htmlFor="is_default" className="cursor-pointer">
              Set as default storage
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button onClick={handleSaveConfiguration} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Existing Storage Profiles</h3>
        {profiles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No storage profiles configured yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {profiles.map((profile) => (
              <StorageProfileCard key={profile.storage_profile_id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
