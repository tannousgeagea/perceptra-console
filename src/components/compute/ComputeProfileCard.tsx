
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Switch } from '@/components/ui/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { ComputeProfile, ComputeStrategy } from '@/types/compute';
import { Cpu, Trash2, Star, Zap, DollarSign, Clock, Loader2, Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { CredentialsSection } from './CredentialsSection';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/ui/alert-dialog';

interface ComputeProfileCardProps {
  profile: ComputeProfile;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  onCredentialsUpdate?: (id: string, hasCredentials: boolean) => void;
  onProfileUpdate?: (id: string, updates: Partial<ComputeProfile>) => void;
}

interface EditableFields {
  name: string;
  default_instance_type: string;
  strategy: ComputeStrategy;
  max_concurrent_jobs: number;
  max_cost_per_hour: number | undefined;
  max_training_hours: number;
  is_active: boolean;
}

const strategyLabels: Record<string, { label: string; icon: typeof Zap }> = {
  cheapest: { label: 'Cheapest', icon: DollarSign },
  fastest: { label: 'Fastest', icon: Zap },
  preferred: { label: 'Preferred', icon: Star },
  queue: { label: 'Queue', icon: Clock },
};

const providerIcons: Record<string, string> = {
  'platform-gpu': '🖥️',
  'platform-cpu': '💻',
  'aws-sagemaker': '☁️',
  'gcp-vertex': '🌐',
  'azure-ml': '🔷',
  'runpod': '🚀',
  'on-premise-agent': '🏢',
  'kubernetes': '⎈',
  'modal': '⚡',
};

export function ComputeProfileCard({ profile, onDelete, onSetDefault, onCredentialsUpdate, onProfileUpdate }: ComputeProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState<EditableFields>({
    name: profile.name,
    default_instance_type: profile.default_instance_type,
    strategy: profile.strategy,
    max_concurrent_jobs: profile.max_concurrent_jobs,
    max_cost_per_hour: profile.max_cost_per_hour,
    max_training_hours: profile.max_training_hours,
    is_active: profile.is_active,
  });
  const [isSaving, setIsSaving] = useState(false);

  const strategy = strategyLabels[profile.strategy] || strategyLabels.queue;
  const StrategyIcon = strategy.icon;

  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText.trim() === profile.name;

  const handleSaveCredentials = async (credentials: Record<string, string>) => {
    // Mock API call - simulate saving credentials
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving credentials for profile:', profile.id, credentials);
    toast.success('Credentials saved successfully');
    onCredentialsUpdate?.(profile.id, true);
  };

  // ✅ Set as default handler
  const handleSetDefault = async () => {
    if (!profile.id) {
      toast.error('Missing compute profile ID');
      return;
    }

    if (profile.is_default) {
      toast.warning('Selected profile is already default');
      return;
    }

    if (!onSetDefault) return;
    try {
      setUpdating(true);
      await onSetDefault(profile.id);
      toast.success('Default compute profile updated');
    } catch (err) {
      toast.error('Failed to update default profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!profile.id) {
      toast.error('Missing compute profile ID');
      return;
    }

    if (profile.is_default) {
      toast.error('Cannot delete default compute profile');
      return;
    }

    if (!onDelete) return;
    try {
      setDeleting(true);
      await onDelete(profile.id);
      toast.success("Selected Profile is deleted");
    } catch (err) {
      toast.error("failed to delete profile");
    } finally {
      setDeleting(false);
    }
  };

  const isLoading = updating || deleting;

  const handleStartEdit = () => {
    setEditFields({
      name: profile.name,
      default_instance_type: profile.default_instance_type,
      strategy: profile.strategy,
      max_concurrent_jobs: profile.max_concurrent_jobs,
      max_cost_per_hour: profile.max_cost_per_hour,
      max_training_hours: profile.max_training_hours,
      is_active: profile.is_active,
    });
    setIsEditing(true);
  };

  const handleActiveChange = (checked: boolean) => {
    setEditFields(prev => ({ ...prev, is_active: checked }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onProfileUpdate?.(profile.id, editFields);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <Card className="border-primary/50 ring-2 ring-primary/20 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                {providerIcons[profile.provider.provider_type] || <Cpu className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Editing Profile</p>
                <p className="text-xs text-muted-foreground">{profile.provider.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Profile Name</Label>
              <Input
                id="name"
                value={editFields.name}
                onChange={(e) => setEditFields(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Profile name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instance">Instance Type</Label>
              <Select
                value={editFields.default_instance_type}
                onValueChange={(value) => setEditFields(prev => ({ ...prev, default_instance_type: value }))}
              >
                <SelectTrigger id="instance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profile.provider.available_instances.map((instance) => (
                    <SelectItem key={instance.name} value={instance.name}>
                      {instance.name} ({instance.gpu_count}x {instance.gpu_type || 'CPU'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy</Label>
              <Select
                value={editFields.strategy}
                onValueChange={(value) => setEditFields(prev => ({ ...prev, strategy: value as ComputeStrategy }))}
              >
                <SelectTrigger id="strategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheapest">💵 Cheapest</SelectItem>
                  <SelectItem value="fastest">⚡ Fastest</SelectItem>
                  <SelectItem value="preferred">⭐ Preferred</SelectItem>
                  <SelectItem value="queue">🕐 Queue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_jobs">Max Concurrent Jobs</Label>
              <Input
                id="max_jobs"
                type="number"
                min={1}
                max={100}
                value={editFields.max_concurrent_jobs}
                onChange={(e) => setEditFields(prev => ({ ...prev, max_concurrent_jobs: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_cost">Max Cost/Hour ($)</Label>
              <Input
                id="max_cost"
                type="number"
                min={0}
                step={0.1}
                value={editFields.max_cost_per_hour || ''}
                onChange={(e) => setEditFields(prev => ({ ...prev, max_cost_per_hour: e.target.value ? parseFloat(e.target.value) : undefined }))}
                placeholder="No limit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_hours">Max Training Hours</Label>
              <Input
                id="max_hours"
                type="number"
                min={1}
                value={editFields.max_training_hours}
                onChange={(e) => setEditFields(prev => ({ ...prev, max_training_hours: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="flex items-center justify-between col-span-full p-3 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="is_active">Profile Active</Label>
                <p className="text-xs text-muted-foreground">Enable or disable this profile</p>
              </div>
              <Switch
                id='is_active'
                checked={editFields.is_active}
                onCheckedChange={handleActiveChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${profile.is_default ? 'border-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
              {providerIcons[profile.provider.provider_type] || <Cpu className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{profile.name}</h4>
                {profile.is_default && (
                  <Badge variant="default" className="text-xs">
                    <Star className="mr-1 h-3 w-3" />
                    Default
                  </Badge>
                )}
                {!profile.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {profile.provider.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStartEdit}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {!profile.is_default && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      title="Set as default"
                    >
                      {updating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Set as Default Compute Profile</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to set <b>{profile.name}</b> as your default compute profile?
                      This will replace your current default configuration.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSetDefault}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50/50"
                    disabled={isLoading || profile.is_default}
                    title={profile.is_default ? 'Cannot delete default profile' : 'Delete profile'}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Storage Profile</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <b>{profile.name}</b>? This action cannot be undone.  
                      To confirm, type the profile name below:
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                
                  <div className="mt-3">
                    <Input
                      placeholder={`Type "${profile.name}" to confirm`}
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                    />
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      disabled={!isConfirmed}
                      className={`${
                        isConfirmed
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <span className="text-muted-foreground">Instance</span>
            <p className="font-medium">{profile.default_instance_type}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Strategy</span>
            <p className="flex items-center gap-1 font-medium">
              <StrategyIcon className="h-3 w-3" />
              {strategy.label}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Max Jobs</span>
            <p className="font-medium">{profile.max_concurrent_jobs}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Max Hours</span>
            <p className="font-medium">{profile.max_training_hours}h</p>
          </div>
        </div>
        
        {profile.max_cost_per_hour && (
          <div className="mt-2 text-sm text-muted-foreground">
            Max cost: ${profile.max_cost_per_hour}/hour
          </div>
        )}

        {profile.provider.requires_user_credentials && (
          <CredentialsSection
            providerType={profile.provider.provider_type}
            hasCredentials={profile.has_credentials}
            onSave={handleSaveCredentials}
          />
        )}
      </CardContent>
    </Card>
  );
}
