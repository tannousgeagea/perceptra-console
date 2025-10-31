import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/ui/dialog';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';
import { UserRole } from '@/types/auth';
import { Shield, Edit3, Eye } from 'lucide-react';

interface UserInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: UserRole) => void;
}

export function UserInviteModal({ open, onOpenChange, onInvite }: UserInviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Viewer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && role) {
      onInvite(email, role);
      setEmail('');
      setRole('Viewer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <div>
                        <div>Admin</div>
                        <div className="text-xs text-muted-foreground">
                          Full management access
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Annotator">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      <div>
                        <div>Annotator</div>
                        <div className="text-xs text-muted-foreground">
                          Can create annotations
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <div>
                        <div>Viewer</div>
                        <div className="text-xs text-muted-foreground">
                          Read-only access
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send Invitation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
