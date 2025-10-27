import { StorageProfile } from '@/types/storage';
import { Card, CardContent } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { Button } from '@/components/ui/ui/button';
import { Cloud, Database, Server, HardDrive, Star, Trash2 } from 'lucide-react';

interface StorageProfileCardProps {
  profile: StorageProfile;
}

const iconMap = {
  azure: Cloud,
  s3: Database,
  minio: Server,
  local: HardDrive,
};

export function StorageProfileCard({ profile }: StorageProfileCardProps) {
  const Icon = iconMap[profile.backend];

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
                {profile.isDefault && (
                  <Badge variant="default" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Default
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
                <span>Created {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!profile.isDefault && (
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
