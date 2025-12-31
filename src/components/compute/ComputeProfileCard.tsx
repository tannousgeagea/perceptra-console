
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { ComputeProfile } from '@/types/compute';
import { Cpu, Trash2, Star, Zap, DollarSign, Clock, Loader2 } from 'lucide-react';
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

export function ComputeProfileCard({ profile, onDelete, onSetDefault, onCredentialsUpdate }: ComputeProfileCardProps) {
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
  return (
    <Card className={profile.is_default ? 'border-primary' : ''}>
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
