import { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  useOrganizationSummary, useOrganizationMembers,
  useInviteMember, useUpdateMember, useRemoveMember,
} from '@/hooks/useOrganization';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { OrgMember } from '@/types/organization';
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
  Users, Search, UserPlus, ArrowLeft, MoreHorizontal, ShieldCheck,
  Mail, Crown, UserCog, Eye, Check, Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// ─── helpers ─────────────────────────────────────────────────────────────────

const ROLES = ['owner', 'admin', 'annotator', 'viewer'] as const;

function roleMeta(role: string): { label: string; classes: string; icon: React.ElementType } {
  switch (role.toLowerCase()) {
    case 'owner':
      return { label: 'Owner',    classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', icon: Crown };
    case 'admin':
      return { label: 'Admin',    classes: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',         icon: ShieldCheck };
    case 'editor':
    case 'annotator':
      return { label: role,       classes: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',             icon: UserCog };
    default:
      return { label: 'Viewer',   classes: 'bg-muted text-muted-foreground',                                           icon: Eye };
  }
}

function statusMeta(status: string) {
  switch (status.toLowerCase()) {
    case 'active':   return { dot: 'bg-emerald-500', label: 'Active',   badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' };
    case 'pending':  return { dot: 'bg-amber-500',   label: 'Pending',  badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' };
    case 'inactive': return { dot: 'bg-slate-400',   label: 'Inactive', badge: 'bg-muted text-muted-foreground' };
    default:         return { dot: 'bg-red-500',     label: status,     badge: 'bg-red-50 text-red-700' };
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

// ─── stat card ────────────────────────────────────────────────────────────────

function RoleStatCard({ icon: Icon, label, count, colorClass }: {
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
  member: OrgMember;
  isSelf: boolean;
  onRoleChange: (role: string) => void;
  onRemove: () => void;
  isUpdating: boolean;
  isRemoving: boolean;
}

function MemberTableRow({ member, isSelf, onRoleChange, onRemove, isUpdating, isRemoving }: MemberRowProps) {
  const hue   = avatarHue(member.id);
  const role  = roleMeta(member.role);
  const st    = statusMeta(member.status);
  const RIcon = role.icon;
  const name  = member.first_name && member.last_name
    ? `${member.first_name} ${member.last_name}`
    : member.username;
  const ago = formatDistanceToNow(new Date(member.joined_at), { addSuffix: true });

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
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Mail size={10} className="flex-shrink-0" />{member.email}
            </p>
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
      <td className="px-4 py-3 hidden md:table-cell">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${st.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />{st.label}
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">{ago}</span>
      </td>
      <td className="px-4 py-3 text-right">
        {isRemoving ? (
          <Loader2 size={15} className="animate-spin text-muted-foreground ml-auto" />
        ) : (
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
                  {ROLES.map(r => (
                    <DropdownMenuItem
                      key={r}
                      onClick={() => onRoleChange(r)}
                      disabled={member.role === r || (isSelf && member.role === 'owner')}
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
                Remove from org
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  );
}

// ─── invite dialog ────────────────────────────────────────────────────────────

function InviteDialog({ open, onClose, onInvite, isPending }: {
  open: boolean; onClose: () => void;
  onInvite: (email: string, role: string) => Promise<void>;
  isPending: boolean;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('viewer');
  const [error, setError] = useState('');

  const reset = () => { setEmail(''); setRole('viewer'); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setError('');
    try {
      await onInvite(email.trim(), role);
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
            <UserPlus size={18} className="text-primary" />Add Member
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="inv-email">Email address</Label>
            <Input
              id="inv-email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isPending && handleSubmit()}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-role">Role</Label>
            <Select value={role} onValueChange={setRole} disabled={isPending}>
              <SelectTrigger id="inv-role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer — read-only</SelectItem>
                <SelectItem value="annotator">Annotator — can label data</SelectItem>
                <SelectItem value="admin">Admin — full management</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!email.trim() || isPending}>
            {isPending
              ? <Loader2 size={14} className="mr-1.5 animate-spin" />
              : <Mail size={14} className="mr-1.5" />
            }
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── remove confirm dialog ────────────────────────────────────────────────────

function RemoveDialog({ member, onClose, onConfirm, isPending }: {
  member: OrgMember | null; onClose: () => void;
  onConfirm: () => void; isPending: boolean;
}) {
  const displayName = member
    ? (member.first_name && member.last_name
        ? `${member.first_name} ${member.last_name}`
        : member.username)
    : '';

  return (
    <AlertDialog open={!!member} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{displayName}</strong> will lose access to this organization and all its projects.
            This can be reversed by adding them again.
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
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full hidden md:block" />
        </div>
      ))}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function OrganizationMembersPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { isOwner, isAdmin } = useCurrentOrganization();
  const { user: currentUser } = useAuth();

  const [search,        setSearch]        = useState('');
  const [roleFilter,    setRoleFilter]    = useState('all');
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [page,          setPage]          = useState(1);
  const [inviteOpen,    setInviteOpen]    = useState(false);
  const [removingMember, setRemovingMember] = useState<OrgMember | null>(null);

  const skip = (page - 1) * PAGE_SIZE;

  const { data: summary, isLoading: loadingOrg } = useOrganizationSummary(orgId);
  const { data: membersData, isLoading: loadingMembers, isFetching } = useOrganizationMembers(orgId, {
    skip,
    limit: PAGE_SIZE,
    search: search || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const inviteMutation = useInviteMember(orgId);
  const updateMutation = useUpdateMember(orgId);
  const removeMutation = useRemoveMember(orgId);

  const members    = membersData?.members ?? [];
  const total      = membersData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => { const k = m.role.toLowerCase(); counts[k] = (counts[k] || 0) + 1; });
    return counts;
  }, [members]);

  // ── Role gate — after all hooks ──
  if (!isOwner && !isAdmin) return <Navigate to="/no-permission" replace />;

  const handleInvite = async (email: string, role: string) => {
    await inviteMutation.mutateAsync({ email, role });
    toast.success('Member added successfully');
    setInviteOpen(false);
  };

  const handleRoleUpdate = (member: OrgMember, role: string) => {
    updateMutation.mutate(
      { userId: member.id, data: { role } },
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
        toast.success(`${removingMember.username} removed from organization`);
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
            <Link to={`/organizations/${orgId}`}><ArrowLeft size={16} /></Link>
          </Button>
          <div>
            {loadingOrg
              ? <Skeleton className="h-7 w-48" />
              : <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Users size={22} className="text-primary" />
                  {summary?.name ?? 'Organization'} Members
                </h1>
            }
            <p className="text-sm text-muted-foreground mt-0.5">Manage access and roles for your team</p>
          </div>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="flex-shrink-0">
          <UserPlus size={15} className="mr-1.5" />Add Member
        </Button>
      </div>

      {/* ── Role breakdown ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <RoleStatCard icon={Users}       label="Total"   count={summary?.user_count ?? total}  colorClass="bg-primary/10 text-primary" />
        <RoleStatCard icon={Crown}       label="Owners"  count={roleCounts['owner'] ?? 0}      colorClass="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" />
        <RoleStatCard icon={ShieldCheck} label="Admins"  count={roleCounts['admin'] ?? 0}      colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" />
        <RoleStatCard icon={Eye}         label="Viewers" count={roleCounts['viewer'] ?? 0}     colorClass="bg-muted text-muted-foreground" />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or username…"
            className="pl-9"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="annotator">Annotator</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Members table ── */}
      <Card className={`overflow-hidden transition-opacity ${isFetching ? 'opacity-70' : ''}`}>
        <CardHeader className="pb-0 px-4 pt-4 flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {total > 0 ? `${total} member${total !== 1 ? 's' : ''}` : 'No members found'}
          </CardTitle>
          {isFetching && <span className="text-xs text-muted-foreground animate-pulse">Refreshing…</span>}
        </CardHeader>
        <Separator className="mt-3" />

        {loadingMembers ? (
          <TableSkeleton />
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Users size={40} className="opacity-20" />
            <p className="text-sm font-medium">No members match your filters</p>
            <Button variant="outline" size="sm" onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setPage(1); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Username</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-2.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <MemberTableRow
                    key={m.id}
                    member={m}
                    isSelf={m.id === currentUser?.id}
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

        {totalPages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
        isPending={inviteMutation.isPending}
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
