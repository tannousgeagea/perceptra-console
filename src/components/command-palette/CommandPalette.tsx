import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCurrentProjectId } from '@/hooks/useCurrentProjectId';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import {
  Activity,
  BarChart3,
  Building2,
  ClipboardCheck,
  Copy,
  CreditCard,
  Database,
  FileText,
  Folder,
  FolderPlus,
  ImageIcon,
  KeyRound,
  Link2,
  Loader,
  Monitor,
  Moon,
  Pencil,
  PlayCircle,
  Scan,
  ScanEye,
  Server,
  Settings,
  Sun,
  Upload,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { useUserProjects } from '@/hooks/useUserProjects';
import { useUserJobs } from '@/hooks/useUserJobs';
import { formatAgo, useRecentSessions, useResumeSession } from '@/hooks/useResumeSession';
import { projectNavItems } from '@/components/layout/projectNav';
import { useCanReview } from '@/hooks/useCanReview';
import { reviewQueueUrl } from '@/hooks/useJobImages';
import { PALETTE_SHORTCUT, useCommandPaletteStore } from '@/stores/commandPaletteStore';


/** IDs are pasted as one token: no spaces, at least a few characters. */
const looksLikeId = (text: string) => /^[\w.-]{6,}$/.test(text);


const PaletteItem = ({
  value,
  keywords,
  icon: Icon,
  label,
  hint,
  trailing,
  onSelect,
  forceMount,
  busy,
}: {
  value: string;
  keywords?: string[];
  icon: LucideIcon;
  label: ReactNode;
  hint?: ReactNode;
  trailing?: ReactNode;
  onSelect: () => void;
  forceMount?: boolean;
  busy?: boolean;
}) => (
  <CommandItem value={value} keywords={keywords} onSelect={onSelect} forceMount={forceMount} className="gap-3 py-2">
    {busy
      ? <Loader className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
      : <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
    <div className="min-w-0 flex-1">
      <div className="truncate">{label}</div>
      {hint && <div className="truncate text-xs text-muted-foreground">{hint}</div>}
    </div>
    {trailing}
  </CommandItem>
);

const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground">
    {children}
  </kbd>
);

/** Mounted only while the palette is open, so its queries run only then. */
const PaletteBody = ({ close }: { close: () => void }) => {
  const navigate = useNavigate();
  const { pathname, search: pageSearch } = useLocation();
  const { setTheme } = useTheme();
  const { currentOrganization, hasAdminPermission } = useCurrentOrganization();
  const currentProjectId = useCurrentProjectId();
  const canReview = useCanReview(currentProjectId ?? undefined);
  const [search, setSearch] = useState('');

  const { data: projects, isLoading: projectsLoading } = useUserProjects();
  const { data: jobs } = useUserJobs();
  const sessions = useRecentSessions();
  const { resume, resuming } = useResumeSession();

  const projectNames = useMemo(
    () => new Map((projects ?? []).map((p) => [p.project_id, p.name])),
    [projects],
  );
  const currentProject = currentProjectId ? projects?.find((p) => p.project_id === currentProjectId) : undefined;

  const go = (to: string) => {
    close();
    if (to !== `${pathname}${pageSearch}`) navigate(to);
  };
  const copy = (text: string, what: string) => {
    close();
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${what} copied`),
      () => toast.error(`Couldn't copy the ${what.toLowerCase()}`),
    );
  };

  const orgId = currentOrganization?.id;
  const pages: { label: string; to: string; icon: LucideIcon; keywords?: string[] }[] = [
    { label: 'Projects', to: '/projects', icon: Folder },
    { label: 'New project', to: '/projects/add', icon: FolderPlus, keywords: ['create', 'add'] },
    { label: 'Datalake', to: '/datalake', icon: Database, keywords: ['images', 'all images'] },
    { label: 'Upload', to: '/upload', icon: Upload, keywords: ['import'] },
    { label: 'Link from storage', to: '/link', icon: Link2, keywords: ['register', 's3', 'bucket'] },
    { label: 'Similarity scans', to: '/similarity/scans', icon: ScanEye, keywords: ['duplicates'] },
    { label: 'Inference', to: '/inference', icon: Scan, keywords: ['predict', 'test model'] },
    { label: 'Activity', to: '/activity', icon: Activity, keywords: ['history', 'log'] },
    ...(orgId
      ? [
          { label: 'Organization', to: `/organizations/${orgId}`, icon: Building2 },
          { label: 'Organization members', to: `/organizations/${orgId}/members`, icon: Users, keywords: ['team', 'invite'] },
        ]
      : []),
    ...(hasAdminPermission
      ? [{ label: 'Team progress & analytics', to: '/team', icon: BarChart3, keywords: ['productivity', 'annotators', 'analytics', 'progress'] }]
      : []),
    { label: 'Billing', to: '/billing', icon: CreditCard },
    { label: 'Invoices', to: '/billing/invoices', icon: FileText },
    { label: 'Account settings', to: '/settings/account', icon: User, keywords: ['profile', 'password'] },
    { label: 'Storage settings', to: '/settings/storage', icon: Server },
    { label: 'Compute settings', to: '/settings/compute', icon: Settings, keywords: ['gpu'] },
    { label: 'API keys', to: '/settings/api-keys', icon: KeyRound, keywords: ['token'] },
  ];

  const trimmed = search.trim();
  const showIdLookup = !!currentProjectId && looksLikeId(trimmed);

  return (
    <Command
      loop
      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
    >
      <CommandInput
        value={search}
        onValueChange={setSearch}
        placeholder="Search projects, jobs, pages — or paste an ID…"
        className="h-12"
      />
      <CommandList className="max-h-[min(60vh,460px)]">
        <CommandEmpty>
          {projectsLoading ? 'Loading…' : `Nothing matches “${trimmed}”.`}
        </CommandEmpty>

        {showIdLookup && (
          <CommandGroup heading="Open by ID">
            <PaletteItem
              forceMount
              value={`open-image-id ${trimmed}`}
              icon={ImageIcon}
              label={<>Open image <span className="font-mono">{trimmed}</span></>}
              hint={`in ${currentProject?.name ?? 'this project'}`}
              onSelect={() => go(`/projects/${currentProjectId}/images/${encodeURIComponent(trimmed)}`)}
            />
          </CommandGroup>
        )}

        {sessions.length > 0 && (
          <CommandGroup heading="Continue where you left off">
            {sessions.slice(0, 3).map((session) => {
              const projectName = projectNames.get(session.projectId) ?? session.projectName;
              return (
                <PaletteItem
                  key={session.key}
                  value={`continue ${session.key}`}
                  keywords={[session.jobName ?? '', projectName ?? '', session.imageName, 'resume', 'continue']}
                  icon={PlayCircle}
                  busy={resuming === session.key}
                  label={session.jobName ?? projectName ?? 'Annotation'}
                  hint={[projectName, session.imageName, formatAgo(session.at)].filter(Boolean).join(' · ')}
                  // Stays open (spinner) while the next image is looked up.
                  onSelect={() => void resume(session).finally(close)}
                />
              );
            })}
          </CommandGroup>
        )}

        {currentProjectId && (
          <CommandGroup heading={currentProject ? `In ${currentProject.name}` : 'This project'}>
            {projectNavItems(currentProjectId).map((item) => (
              <PaletteItem
                key={item.path}
                value={`project-page ${item.path}`}
                keywords={[item.label, item.section, ...(item.keywords ?? [])]}
                icon={item.icon}
                label={item.label}
                onSelect={() => go(item.path)}
              />
            ))}
            {canReview && (
              <PaletteItem
                value="project-review-queue"
                keywords={['review', 'queue', 'approve', 'send back', 'all jobs']}
                icon={ClipboardCheck}
                label="Review queue (all jobs)"
                onSelect={() => go(reviewQueueUrl(currentProjectId))}
              />
            )}
          </CommandGroup>
        )}

        {!!jobs?.length && (
          <CommandGroup heading="My jobs">
            {jobs.map((job) => (
              <PaletteItem
                key={job.id}
                value={`job ${job.id}`}
                keywords={[job.name, job.project_name ?? '', String(job.id), 'job']}
                icon={Pencil}
                label={job.name}
                trailing={<span className="text-xs capitalize text-muted-foreground">{String(job.status).replace('_', ' ')}</span>}
                onSelect={() => go(`/projects/${job.project_id}/annotate/job/${job.id}`)}
              />
            ))}
          </CommandGroup>
        )}

        {!!projects?.length && (
          <CommandGroup heading="Projects">
            {projects.map((project) => (
              <PaletteItem
                key={project.project_id}
                value={`project ${project.project_id}`}
                keywords={[project.name, project.project_id, project.project_type_name ?? '']}
                icon={Folder}
                label={project.name}
                hint={project.project_type_name}
                trailing={project.project_id === currentProjectId ? <span className="text-xs text-muted-foreground">current</span> : undefined}
                onSelect={() => go(`/projects/${project.project_id}/dataset`)}
              />
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Go to">
          {pages.map((page) => (
            <PaletteItem
              key={page.to}
              value={`page ${page.to}`}
              keywords={[page.label, ...(page.keywords ?? [])]}
              icon={page.icon}
              label={page.label}
              onSelect={() => go(page.to)}
            />
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Actions">
          {currentProjectId && (
            <PaletteItem
              value="action copy-project-id"
              keywords={['copy project id', 'identifier']}
              icon={Copy}
              label="Copy project ID"
              onSelect={() => copy(currentProjectId, 'Project ID')}
            />
          )}
          <PaletteItem
            value="action copy-link"
            keywords={['copy link', 'share', 'url']}
            icon={Link2}
            label="Copy link to this page"
            onSelect={() => copy(window.location.href, 'Link')}
          />
          <PaletteItem value="action theme-light" keywords={['light theme', 'appearance']} icon={Sun} label="Light theme" onSelect={() => { close(); setTheme('light'); }} />
          <PaletteItem value="action theme-dark" keywords={['dark theme', 'appearance', 'night']} icon={Moon} label="Dark theme" onSelect={() => { close(); setTheme('dark'); }} />
          <PaletteItem value="action theme-system" keywords={['system theme', 'appearance', 'auto']} icon={Monitor} label="System theme" onSelect={() => { close(); setTheme('system'); }} />
        </CommandGroup>
      </CommandList>
      <div className="flex items-center gap-3 border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> move</span>
        <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
        <span className="flex items-center gap-1"><Kbd>Esc</Kbd> close</span>
        <span className="ml-auto flex items-center gap-1"><Kbd>{PALETTE_SHORTCUT}</Kbd> anywhere</span>
      </div>
    </Command>
  );
};

/**
 * Global command palette (⌘K / Ctrl+K): jump to any project, job, project
 * page or settings page, continue the last annotation session, open an
 * image by ID, and a few quick actions.
 */
const CommandPalette = () => {
  const { isAuthenticated } = useAuth();
  const { open, setOpen, toggle } = useCommandPaletteStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault(); // the browser's own Ctrl+K (address-bar search)
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAuthenticated, toggle]);

  if (!isAuthenticated) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[15%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search projects, jobs and pages, or continue where you left off.
        </DialogDescription>
        <PaletteBody close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
