import { useState } from 'react';
import { StorageProfile } from '@/types/storage';
import { Card, CardContent } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Cloud, Database, Server, HardDrive, Star, Trash2, Loader2, Globe, KeyRound, Lock } from 'lucide-react';
import { useDeleteStorageProfile, useRotateStorageCredentials, useUpdateStorageProfile } from '@/hooks/useStorage';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/ui/dialog';
import { CredentialFields, CredentialForm, buildCredentials } from './CredentialFields';

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

interface StorageProfileCardProps {
  profile: StorageProfile;
}

const iconMap = {
  azure: Cloud,
  s3: Database,
  minio: Server,
  gcs: Globe,
  local: HardDrive,
};

export function StorageProfileCard({ profile }: StorageProfileCardProps) {
  const Icon = iconMap[profile.backend] ?? Database;
  const isExternal = profile.access_mode === 'external_readonly';
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText.trim() === profile.name;
  const [rotateOpen, setRotateOpen] = useState(false);
  const [rotateForm, setRotateForm] = useState<CredentialForm>({});

  // ✅ Use hooks
  const { mutate: deleteProfile, isPending: isDeleting } = useDeleteStorageProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateStorageProfile();
  const { mutate: rotateCredentials, isPending: isRotating } = useRotateStorageCredentials({
    onSuccess: () => {
      setRotateOpen(false);
      setRotateForm({});
    },
  });

  const handleRotate = () => {
    if (!profile.storage_profile_id) return toast.error('Missing storage profile ID');
    rotateCredentials({
      storageProfileId: profile.storage_profile_id,
      credentials: buildCredentials(profile.backend, rotateForm),
    });
  };

  // ✅ Set as default handler
  const handleSetDefault = () => {
    if (!profile.storage_profile_id) return toast.error('Missing storage profile ID');
  
    updateProfile({
      storageProfileId: profile.storage_profile_id,
      payload: { is_default: true },
    });
  };

  // ✅ Delete handler with confirmation
  const handleDelete = () => {
    if (!profile.storage_profile_id) return toast.error('Missing storage profile ID');

    if (profile.is_default) {
      toast.error('Cannot delete default storage profile');
      return;
    }

    deleteProfile(profile.storage_profile_id);
  };

  const isLoading = isDeleting || isUpdating || isRotating;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{profile.name}</h4>
                {profile.is_default && (
                  <Badge variant="default" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Default
                  </Badge>
                )}
                {isExternal && (
                  <Badge variant="secondary" className="gap-1" title="Files belong to another system: referenced, never written or deleted">
                    <Lock className="h-3 w-3" />
                    External · read-only
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="capitalize">{profile.backend}</span>
                {profile.region && (
                  <>
                    <span>•</span>
                    <span>{profile.region}</span>
                  </>
                )}
                <span>•</span>
                <span>Created {new Date(profile.created_at ?? "").toLocaleDateString()}</span>

                <span>•</span>
                <span>Updated {new Date(profile.updated_at ?? "").toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {profile.backend !== 'local' && (
              <Dialog open={rotateOpen} onOpenChange={setRotateOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLoading} title="Rotate credentials">
                    <KeyRound className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rotate credentials — {profile.name}</DialogTitle>
                    <DialogDescription>
                      The new credential is tested against this storage before it replaces the current one. The profile
                      keeps its id, so every image registered on it keeps loading.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <CredentialFields
                      backend={profile.backend}
                      form={rotateForm}
                      onChange={(field, value) => setRotateForm({ ...rotateForm, [field]: value })}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRotateOpen(false)}>Cancel</Button>
                    <Button onClick={handleRotate} disabled={isRotating}>
                      {isRotating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Test & rotate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                {!profile.is_default && !isExternal && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    title="Set as default"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Set as Default Storage Profile</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to set <b>{profile.name}</b> as your default storage profile?
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


            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50/50"
                  disabled={isLoading || profile.is_default}
                  title={profile.is_default ? 'Cannot delete default profile' : 'Delete profile'}
                >
                  {isDeleting ? (
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
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
