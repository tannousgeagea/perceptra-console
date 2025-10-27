import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Textarea } from '@/components/ui/ui/textarea';
import { toast } from 'sonner';
import { api } from './api';
import { StorageBackend, StorageProfile } from '@/types/storage';
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
  const [profiles, setProfiles] = useState<StorageProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Load profiles on mount
  useState(() => {
    api.getStorageProfiles().then(setProfiles);
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await api.testConnection(selectedBackend, formData);
      if (result.success) {
        toast.success(result.message, {
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
      } else {
        toast.error(result.message, {
          icon: <XCircle className="h-4 w-4" />,
        });
      }
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setLoading(true);
    try {
      const newProfile = await api.createStorageProfile({
        name: formData.name || `${selectedBackend} Storage`,
        backend: selectedBackend,
        region: formData.region,
        config: formData,
      });
      setProfiles([...profiles, newProfile]);
      toast.success('Storage configuration saved successfully');
      setFormData({});
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
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

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button onClick={handleSaveConfiguration} disabled={loading}>
              {loading ? (
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
              <StorageProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
