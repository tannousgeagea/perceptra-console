import { useParams, Link, Navigate } from 'react-router-dom';
import { useOrganizationDetails, useOrganizationProjects } from '@/hooks/useOrganization';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { Button } from '@/components/ui/ui/button';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Separator } from '@/components/ui/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/ui/avatar';
import {
  Users, FolderKanban, ImageIcon, Activity, ArrowRight, Building2,
  ShieldCheck, CalendarDays, Globe, ExternalLink, ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ─── helpers ─────────────────────────────────────────────────────────────────

function roleColor(role: string) {
  switch (role.toLowerCase()) {
    case 'owner':   return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300';
    case 'admin':   return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
    case 'editor':
    case 'annotator': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
    default:        return 'bg-muted text-muted-foreground';
  }
}

function statusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'active':  return 'bg-emerald-500';
    case 'pending': return 'bg-amber-500';
    default:        return 'bg-muted-foreground';
  }
}

function initials(first: string, last: string, username: string) {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  return (username.slice(0, 2)).toUpperCase();
}

function avatarHue(id: string) {
  const hues = [210, 270, 160, 30, 340, 190, 120];
  const n = parseInt(id.replace(/\D/g, '').slice(-3) || '0', 10);
  return hues[n % hues.length];
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, sub,
}: { label: string; value: number | string; icon: React.ElementType; sub?: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <span className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Icon size={20} />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectRow({ project, orgId }: { project: { id: string; name: string; is_active: boolean; member_count: number; created_at: string }; orgId: string }) {
  return (
    <Link
      to={`/projects/${project.id}/dataset`}
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/60 transition-colors"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${project.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
      <span className="flex-1 text-sm font-medium truncate group-hover:text-primary transition-colors">
        {project.name}
      </span>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {project.member_count} {project.member_count === 1 ? 'member' : 'members'}
      </span>
      <ChevronRight size={14} className="text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
    </Link>
  );
}

function MemberRow({ member }: { member: { id: string; username: string; first_name: string; last_name: string; email: string; role: string; status: string; joined_at: string } }) {
  const hue = avatarHue(member.id);
  const ago = formatDistanceToNow(new Date(member.joined_at), { addSuffix: true });
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback
          className="text-xs font-semibold text-white"
          style={{ background: `hsl(${hue} 65% 50%)` }}
        >
          {initials(member.first_name, member.last_name, member.username)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {member.first_name && member.last_name
            ? `${member.first_name} ${member.last_name}`
            : member.username}
        </p>
        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${roleColor(member.role)}`}>
          {member.role}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${statusColor(member.status)}`} />
      </div>
      <span className="hidden lg:block text-xs text-muted-foreground whitespace-nowrap">{ago}</span>
    </div>
  );
}

// ─── skeleton ────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <Skeleton className="lg:col-span-3 h-80 rounded-xl" />
        <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function OrganizationPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { isOwner, isAdmin } = useCurrentOrganization();

  const { data: details, isLoading: loadingDetails, error } = useOrganizationDetails(orgId);
  const { data: projectsData, isLoading: loadingProjects } = useOrganizationProjects(orgId);

  // Role gate — must be after all hook calls
  if (!isOwner && !isAdmin) return <Navigate to="/no-permission" replace />;

  const isLoading = loadingDetails || loadingProjects;

  if (isLoading) return <PageSkeleton />;
  if (error || !details) return <Navigate to="/no-permission" replace />;

  const { statistics: stats, recent_members: recentMembers } = details;
  const projects = projectsData?.projects ?? [];

  return (
    <div className="space-y-6 p-6 animate-fade-in w-full">

      {/* ── Hero banner ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary-dark text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)]" />
        <div className="relative px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
              <Building2 size={30} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{details.name}</h1>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white/90 text-xs font-mono">
                  {details.slug}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white`}>
                  <ShieldCheck size={11} className="mr-1" />
                  {details.current_user_role}
                </span>
              </div>
              {details.description && (
                <p className="mt-1 text-sm text-white/75 max-w-xl">{details.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-white/60 flex-wrap">
                <span className="flex items-center gap-1">
                  <CalendarDays size={11} />
                  Created {formatDistanceToNow(new Date(details.created_at), { addSuffix: true })}
                </span>
                {details.website && (
                  <a
                    href={details.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Globe size={11} />
                    {details.website}
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 border-0 text-white backdrop-blur-sm">
              <Link to={`/organizations/${orgId}/members`}>
                <Users size={14} className="mr-1.5" />
                Manage Members
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={stats.total_members}
          icon={Users}
          sub={`${stats.active_members} active`}
        />
        <StatCard
          label="Active Members"
          value={stats.active_members}
          icon={Activity}
          sub={`${stats.pending_members} pending`}
        />
        <StatCard
          label="Projects"
          value={stats.total_projects}
          icon={FolderKanban}
          sub={`${stats.active_projects} active`}
        />
        <StatCard
          label="Images"
          value={stats.total_images.toLocaleString()}
          icon={ImageIcon}
          sub="across all projects"
        />
      </div>

      {/* ── Main content ── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Projects */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FolderKanban size={16} className="text-primary" />
              Projects
              <span className="ml-1 text-xs font-normal text-muted-foreground">({stats.total_projects})</span>
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs h-7 px-2">
              <Link to="/projects">
                View all <ArrowRight size={12} className="ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="flex-1 pt-2 px-3">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                <FolderKanban size={32} className="opacity-30" />
                <p className="text-sm">No projects yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {projects.slice(0, 10).map(p => (
                  <ProjectRow key={p.id} project={p} orgId={orgId!} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Members */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Recent Members
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs h-7 px-2">
              <Link to={`/organizations/${orgId}/members`}>
                View all <ArrowRight size={12} className="ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="flex-1 pt-2">
            {recentMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                <Users size={32} className="opacity-30" />
                <p className="text-sm">No members yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentMembers.map(m => (
                  <MemberRow key={m.id} member={m} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
