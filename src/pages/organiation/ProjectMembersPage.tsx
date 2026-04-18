import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectMembers, useAddProjectMember, useUpdateProjectMember, useRemoveProjectMember } from '@/hooks/useProjectMembers';
import { useOrganizationMembers } from '@/hooks/useOrganization';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectMember, OrgMember } from '@/types/organization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Separator } from '@/components/ui/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from '@/components/ui/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/ui/alert-dialog';
import { Label } from '@/components/ui/ui/label';
import {
  Users, Search, UserPlus, ArrowLeft, MoreHorizontal,
  ShieldCheck, Crown, UserCog, Eye, Check, Loader2, FolderKanban,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// ─── constants ────────────────────────────────────────────────────────────────

const PROJECT_ROLES = ['viewer', 'annotator', 'reviewer', 'editor', 'admin'] as const;

// ─── helpers ──────────────────────────────────────────────────────────────────

function roleMeta(role: string): { label: string; classes: string; icon: React.ElementType } {
  switch (role.toLowerCase()) {
    case 'owner':
    case 'admin':
      return { label: role,       classes: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',     icon: ShieldCheck };
    case 'editor':
      return { label: 'Editor',   classes: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',         icon: UserCog };
    case 'reviewer':
      return { label: 'Reviewer', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: Crown };
    case 'annotator':
      return { label: 'Annotator', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: UserCog };
    default:
      return { label: 'Viewer',   classes: 'bg-muted text-muted-foreground',                                        icon: Eye };
  }
}

function avatarHue(id: string) {
  const hues = [210, 270, 160, 30, 340, 190, 120];
  return hues[parseInt(id.replace(/\D/g, '').slice(-3) || '0', 10) % hues.length];
}

function initials(first: string, last: string, username: string) {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function displayName(m: { first_name: string; last_name: string; username: string }) {
  return m.first_name && m.last_name ? `${m.first_name} ${m.last_name}` : m.username;
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, count, colorClass }: {
  icon: React.ElementType; label: string; count: number; colorClass: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-3">
        <span className={`p-2 rounded-lg ${colorClass}`}><Icon size={16} /></span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tabular-nums leading-none mt-0.5">{count}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── member row ───────────────────────────────────────────────────────────────

interface MemberRowProps {
  member: ProjectMember;
  isSelf: boolean;
  canManage: boolean;
  onRoleChange: (role: string) => void;
  onRemove: () => void;
  isUpdating: boolean;
  isRemoving: boolean;
}

function MemberTableRow({ member, isSelf, canManage, onRoleChange, onRemove, isUpdating, isRemoving }: MemberRowProps) {
  const hue   = avatarHue(member.id);
  const role  = roleMeta(member.role);
  const RIcon = role.icon;
  const name  = displayName(member);
  const ago   = formatDistanceToNow(new Date(member.joined_at), { addSuffix: true });

  return (
    <tr className="border-b border-border/50 hover:bg-muted/40 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarFallback className="text-xs font-bold text-white" style={{ background: `hsl(${hue} 65% 50%)` }}>
              {initials(member.first_name, member.last_name, member.username)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate flex items-center gap-1.5">
              {name}
              {isSelf && (
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">you</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-xs text-muted-foreground font-mono">@{member.username}</span>
      </td>
      <td className="px-4 py-3">
        {isUpdating ? (
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        ) : (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${role.classes}`}>
            <RIcon size={11} />{role.label}
          </span>
        )}
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">{ago}</span>
      </td>
      <td className="px-4 py-3 text-right">
        {isRemoving ? (
          <Loader2 size={15} className="animate-spin text-muted-foreground ml-auto" />
        ) : canManage ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserCog size={14} className="mr-2" />Change role
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {PROJECT_ROLES.map(r => (
                    <DropdownMenuItem
                      key={r}
                      onClick={() => onRoleChange(r)}
                      disabled={member.role === r}
                      className="capitalize"
                    >
                      {member.role === r
                        ? <Check size={13} className="mr-2 text-primary" />
                        : <span className="w-5 mr-2" />
                      }
                      {r}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onRemove}
                disabled={isSelf}
              >
                Remove from project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </td>
    </tr>
  );
}

// ─── add member dialog ────────────────────────────────────────────────────────

function AddMemberDialog({ open, onClose, onAdd, isPending, orgMembers, projectMemberIds }: {
  open: boolean;
  onClose: () => void;
  onAdd: (userId: string, role: string) => Promise<void>;
  isPending: boolean;
  orgMembers: OrgMember[];
  projectMemberIds: Set<string>;
}) {
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<OrgMember | null>(null);
  const [role,     setRole]     = useState('viewer');
  const [error,    setError]    = useState('');

  const reset = () => { setSearch(''); setSelected(null); setRole('viewer'); setError(''); };
  const handleClose = () => { reset(); onClose(); };

  const available = useMemo(() =>
    orgMembers.filter(m =>
      !projectMemberIds.has(m.id) &&
      (
        m.username.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())
      )
    ),
    [orgMembers, projectMemberIds, search]
  );

  const handleSubmit = async () => {
    if (!selected) return;
    setError('');
    try {
      await onAdd(selected.id, role);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={18} className="text-primary" />Add Project Member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* member search */}
          <div className="space-y-1.5">
            <Label>Select organization member</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                className="pl-9"
                value={search}
                onChange={e => { setSearch(e.target.value); setSelected(null); }}
                disabled={isPending}
              />
            </div>
            {search && (
              <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
                {available.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No available members found</p>
                ) : (
                  available.slice(0, 20).map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors ${selected?.id === m.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setSelected(m)}
                    >
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback
                          className="text-[10px] font-bold text-white"
                          style={{ background: `hsl(${avatarHue(m.id)} 65% 50%)` }}
                        >
                          {initials(m.first_name, m.last_name, m.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{displayName(m)}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                      </div>
                      {selected?.id === m.id && <Check size={14} className="text-primary flex-shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            )}
            {selected && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback
                    className="text-[10px] font-bold text-white"
                    style={{ background: `hsl(${avatarHue(selected.id)} 65% 50%)` }}
                  >
                    {initials(selected.first_name, selected.last_name, selected.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium flex-1 truncate">{displayName(selected)}</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setSelected(null)}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* role */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-role">Project role</Label>
            <Select value={role} onValueChange={setRole} disabled={isPending}>
              <SelectTrigger id="proj-role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer — read-only</SelectItem>
                <SelectItem value="annotator">Annotator — can label data</SelectItem>
                <SelectItem value="reviewer">Reviewer — can review annotations</SelectItem>
                <SelectItem value="editor">Editor — full data access</SelectItem>
                <SelectItem value="admin">Admin — manage project members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selected || isPending}>
            {isPending
              ? <Loader2 size={14} className="mr-1.5 animate-spin" />
              : <UserPlus size={14} className="mr-1.5" />
            }
            Add to Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── remove confirm dialog ────────────────────────────────────────────────────

function RemoveDialog({ member, onClose, onConfirm, isPending }: {
  member: ProjectMember | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <AlertDialog open={!!member} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove from project?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{member ? displayName(member) : ''}</strong> will lose access to this project.
            They will remain a member of the organization and can be re-added at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 size={14} className="mr-1.5 animate-spin" />}
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ProjectMembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { isOwner, isAdmin, currentOrganization } = useCurrentOrganization();
  const { user: currentUser } = useAuth();
  const orgId = currentOrganization?.id;

  const canManage = isOwner || isAdmin;

  const [search,         setSearch]         = useState('');
  const [roleFilter,     setRoleFilter]      = useState('all');
  const [addOpen,        setAddOpen]         = useState(false);
  const [removingMember, setRemovingMember]  = useState<ProjectMember | null>(null);

  const { data: members = [], isLoading } = useProjectMembers(orgId, projectId);
  const { data: orgMembersData } = useOrganizationMembers(orgId, { limit: 200 });

  const addMutation    = useAddProjectMember(orgId, projectId);
  const updateMutation = useUpdateProjectMember(orgId, projectId);
  const removeMutation = useRemoveProjectMember(orgId, projectId);

  const projectMemberIds = useMemo(() => new Set(members.map(m => m.id)), [members]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => { const k = m.role.toLowerCase(); counts[k] = (counts[k] || 0) + 1; });
    return counts;
  }, [members]);

  const filtered = useMemo(() =>
    members.filter(m => {
      const matchesSearch = !search || (
        m.username.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        displayName(m).toLowerCase().includes(search.toLowerCase())
      );
      const matchesRole = roleFilter === 'all' || m.role.toLowerCase() === roleFilter;
      return matchesSearch && matchesRole;
    }),
    [members, search, roleFilter]
  );

  const handleAdd = async (userId: string, role: string) => {
    await addMutation.mutateAsync({ userId, role });
    toast.success('Member added to project');
    setAddOpen(false);
  };

  const handleRoleUpdate = (member: ProjectMember, role: string) => {
    updateMutation.mutate(
      { userId: member.id, role },
      {
        onSuccess: () => toast.success(`${member.username}'s role updated to ${role}`),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update role'),
      },
    );
  };

  const handleRemoveConfirm = () => {
    if (!removingMember) return;
    removeMutation.mutate(removingMember.id, {
      onSuccess: () => {
        toast.success(`${removingMember.username} removed from project`);
        setRemovingMember(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to remove member');
        setRemovingMember(null);
      },
    });
  };

  const updatingId = updateMutation.isPending ? updateMutation.variables?.userId : undefined;
  const removingId = removeMutation.isPending  ? removeMutation.variables         : undefined;

  return (
    <div className="space-y-6 p-6 animate-fade-in w-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Link to={`/projects/${projectId}/dataset`}><ArrowLeft size={16} /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FolderKanban size={20} className="text-primary" />
              Project Members
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage who has access to this project</p>
          </div>
        </div>
        {canManage && (
          <Button onClick={() => setAddOpen(true)} className="flex-shrink-0">
            <UserPlus size={15} className="mr-1.5" />Add Member
          </Button>
        )}
      </div>

      {/* ── Role breakdown ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Total"      count={members.length}              colorClass="bg-primary/10 text-primary" />
        <StatCard icon={ShieldCheck} label="Admins"    count={roleCounts['admin'] ?? 0}    colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" />
        <StatCard icon={UserCog}    label="Annotators" count={roleCounts['annotator'] ?? 0} colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <StatCard icon={Eye}        label="Viewers"    count={roleCounts['viewer'] ?? 0}   colorClass="bg-muted text-muted-foreground" />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {PROJECT_ROLES.map(r => (
              <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Members table ── */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0 px-4 pt-4 flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {filtered.length > 0
              ? `${filtered.length} member${filtered.length !== 1 ? 's' : ''}${filtered.length !== members.length ? ` of ${members.length}` : ''}`
              : 'No members found'}
          </CardTitle>
        </CardHeader>
        <Separator className="mt-3" />

        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Users size={40} className="opacity-20" />
            <p className="text-sm font-medium">
              {members.length === 0 ? 'No members yet' : 'No members match your filters'}
            </p>
            {(search || roleFilter !== 'all') && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(''); setRoleFilter('all'); }}>
                Clear filters
              </Button>
            )}
            {members.length === 0 && canManage && (
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <UserPlus size={14} className="mr-1.5" />Add first member
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Username</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-2.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <MemberTableRow
                    key={m.id}
                    member={m}
                    isSelf={m.id === currentUser?.id}
                    canManage={canManage}
                    onRoleChange={role => handleRoleUpdate(m, role)}
                    onRemove={() => setRemovingMember(m)}
                    isUpdating={updatingId === m.id}
                    isRemoving={removingId === m.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddMemberDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
        isPending={addMutation.isPending}
        orgMembers={orgMembersData?.members ?? []}
        projectMemberIds={projectMemberIds}
      />

      <RemoveDialog
        member={removingMember}
        onClose={() => setRemovingMember(null)}
        onConfirm={handleRemoveConfirm}
        isPending={removeMutation.isPending}
      />
    </div>
  );
}
