
import { memo } from 'react'
import { FC, useState, useEffect, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Menu,
  Folder,
  Database,
  Upload,
  ScanEye,
  Scan,
  Search,
  Users,
  Bell,
  PanelLeft,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileNavStore } from '@/stores/mobileNavStore';
import { useUserJobs } from '@/hooks/useUserJobs';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationStore } from '@/stores/notificationStore';
import { MTXLogo } from '@/components/logo/MTXLogo';
import { cn } from '@/lib/utils';
import { UserProfileMenu } from '../users/UserProfileMenu';
import { getCurrentUser } from '@/utils/user';
import { OrganizationSection } from '@/components/organization/OrganizationSection';
import { useAuthHelpers, useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { PALETTE_SHORTCUT, useCommandPaletteStore } from '@/stores/commandPaletteStore';


interface NavbarItem {
  item: string;
  ref: string;
  icon: ReactNode;
}

const Navbar: FC = () => {
  const [expandedPref, setIsExpanded] = useState<boolean>(true);
  const isMobile = useIsMobile();
  // On phones the menu is a drawer, always shown with labels.
  const isExpanded = isMobile || expandedPref;
  const panel = useMobileNavStore((s) => s.panel);
  const setPanel = useMobileNavStore((s) => s.setPanel);
  const location = useLocation();
  const inProject = /^\/projects\/[^/]+/.test(location.pathname);
  const helpers = useAuthHelpers();
  const openPalette = useCommandPaletteStore((s) => s.setOpen);
  const { hasAdminPermission } = useCurrentOrganization();
  const openNotifications = useNotificationStore((s) => s.setOpen);
  const { data: noticePage } = useNotifications();
  const unreadCount = noticePage?.unread ?? 0;
  const unreadSentBack = !!noticePage?.items.some((n) => !n.read && n.kind === 'sent_back');
  const { data: myJobs } = useUserJobs();
  const toFixTotal = (myJobs ?? []).reduce((sum, job) => sum + (job.to_fix ?? 0), 0);

  useEffect(() => {
    if (location.pathname.includes('/projects/')) {
      setIsExpanded(false);
    }
    // A link was followed: close the phone drawer.
    setPanel(null);
  }, [location.pathname, setPanel]);

  const organization = helpers.getPrimaryOrganization()
  const currentUser = getCurrentUser();

  const items: NavbarItem[] = [
    { item: "Projects", ref: "/projects", icon: <Folder size={20} /> },
    { item: "Datalake", ref: "/datalake", icon: <Database size={20} /> },
    { item: "Similarity", ref: "/similarity", icon: <ScanEye size={20} /> },
    { item: "Upload", ref: "/upload", icon: <Upload size={20} /> },
    { item: "Inference", ref: "/inference", icon: <Scan size={20} /> },
    // Models and deployment live inside each project (project menu → Models,
    // and a model's Deployment tab); there's no organization-wide page for them.
    // Team progress and analytics are org-admin only (the API enforces it too).
    ...(hasAdminPermission ? [{ item: "Team", ref: "/team", icon: <Users size={20} /> }] : []),
  ];

  const toggleNavbar = (): void => {
    if (isMobile) {
      setPanel(null);
      return;
    }
    setIsExpanded(!expandedPref);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <>
    {/* Phones: a top bar opens the menus as drawers. */}
    <header className="flex h-12 w-full shrink-0 items-center gap-2 border-b border-[var(--mtx-border)] bg-[var(--mtx-bg)] px-2 text-[var(--mtx-text)] md:hidden">
      <button
        type="button"
        onClick={() => setPanel('app')}
        aria-label="Open menu"
        className="rounded-lg p-2 text-[var(--mtx-text-muted)] hover:bg-[var(--mtx-surface)] hover:text-[var(--mtx-text)]"
      >
        <Menu size={22} />
      </button>
      <MTXLogo badgeClassName="w-7 h-7" />
      {inProject && (
        <button
          type="button"
          onClick={() => setPanel('project')}
          className="ml-auto flex items-center gap-2 rounded-lg border border-[var(--mtx-border)] px-3 py-1.5 text-sm text-[var(--mtx-text-muted)] hover:bg-[var(--mtx-surface)] hover:text-[var(--mtx-text)]"
        >
          <PanelLeft size={16} />
          Project menu
        </button>
      )}
    </header>
    {panel && (
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={() => setPanel(null)}
        aria-hidden="true"
      />
    )}
    <aside
      className={cn(
        'flex h-[100dvh] flex-col justify-between overflow-y-auto border-r will-change-[width] transition-[width,transform] duration-300 ease-in-out',
        "bg-[var(--mtx-bg)] text-[var(--mtx-text)] border-[var(--mtx-border)]",
        isExpanded ? 'w-[210px] px-3' : 'w-[68px] px-2',
        // Phones: a drawer that slides in from the left.
        'fixed inset-y-0 left-0 z-50 shadow-xl md:static md:z-auto md:translate-x-0 md:shadow-none',
        panel === 'app' ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div>
        {/* Top */}
        <div className="w-full mb-4 flex flex-col justify-center items-center py-6 gap-6">
          <button
            className={cn(
              'rounded-lg p-2 transition-colors',
              'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              'dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
            )}
            onClick={toggleNavbar}
            aria-label='Toggle navigation'
          >
            {isExpanded ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div 
            className={cn(
              'flex w-full items-center',
              isExpanded ? 'justify-start px-2 gap-3' : 'justify-center'
            )}
          >
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl 
              bg-[linear-gradient(135deg,var(--mtx-accent),var(--mtx-primary),var(--mtx-secondary))]">
              <ScanEye className="h-5 w-5 text-white" />
            </div> */}

            <MTXLogo
              compact={!isExpanded}
              badgeClassName={isExpanded ? "w-7 h-7" : "w-8 h-8"}
            />
            {/* {isExpanded && (
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
                  Malumetrix
                </h2>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  Visual Intelligence
                </p>
              </div>
            )} */}
          </div>
        </div>

        {/* Command palette */}
        <div className={cn('mb-3', isExpanded ? '' : 'flex justify-center')}>
          <button
            type="button"
            onClick={() => openPalette(true)}
            title={`Search and jump anywhere (${PALETTE_SHORTCUT})`}
            aria-label="Open command palette"
            className={cn(
              'flex items-center rounded-xl border text-sm transition-colors',
              'border-[var(--mtx-border)] text-[var(--mtx-text-muted)] hover:bg-[var(--mtx-surface)] hover:text-[var(--mtx-text)]',
              isExpanded ? 'w-full gap-2 px-3 py-2' : 'h-[44px] w-[44px] justify-center'
            )}
          >
            <Search size={isExpanded ? 16 : 20} className="shrink-0" />
            {isExpanded && (
              <>
                <span className="flex-1 text-left">Search…</span>
                <kbd className="rounded border border-[var(--mtx-border)] px-1.5 py-0.5 font-sans text-[10px]">{PALETTE_SHORTCUT}</kbd>
              </>
            )}
          </button>
        </div>

        {/* Notifications (new jobs, work sent back) and my jobs */}
        <div className={cn('mb-3', isExpanded ? '' : 'flex justify-center')}>
          <button
            type="button"
            onClick={() => openNotifications(true)}
            title={unreadCount ? `${unreadCount} unread notifications` : toFixTotal ? `${toFixTotal} images sent back to you` : 'Notifications and my jobs'}
            aria-label="Open notifications"
            className={cn(
              'relative flex items-center rounded-xl border text-sm transition-colors',
              'border-[var(--mtx-border)] text-[var(--mtx-text-muted)] hover:bg-[var(--mtx-surface)] hover:text-[var(--mtx-text)]',
              isExpanded ? 'w-full gap-2 px-3 py-2' : 'h-[44px] w-[44px] justify-center'
            )}
          >
            <Bell size={isExpanded ? 16 : 20} className="shrink-0" />
            {isExpanded && <span className="flex-1 text-left">Notifications</span>}
            {unreadCount > 0 ? (
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white',
                  isExpanded ? '' : 'absolute -right-1 -top-1',
                  unreadSentBack ? 'bg-rose-600' : 'bg-[var(--mtx-primary)]'
                )}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : toFixTotal > 0 ? (
              <span className={cn('h-2 w-2 rounded-full bg-rose-600', isExpanded ? '' : 'absolute right-1.5 top-1.5')} />
            ) : null}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1">
          {items.map((item, index) => {
            const active = isActive(item.ref);

            return (
              <div
                key={index}
                className={cn(
                  "transition-all duration-300",
                  isExpanded ? "" : "flex justify-center"
                )}
              >
                <Link
                  to={item.ref}
                  className={cn(
                    'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isExpanded ? 'w-full' : 'w-[44px] justify-center px-0',
                    active
                      ? "bg-[linear-gradient(90deg,var(--mtx-accent),var(--mtx-primary),var(--mtx-secondary))] text-white"
                      : "text-[var(--mtx-text-muted)] hover:bg-[var(--mtx-surface)] hover:text-[var(--mtx-text)]"
                  )}
                >
                  <div 
                    className={cn(
                      'shrink-0 transition-all duration-300', 
                      isExpanded ? "mr-3" : ""
                    )}>
                    {item.icon}
                  </div>

                  {isExpanded && (
                    <span
                      className="truncate"
                      style={{ maxWidth: '130px' }}
                    >
                      {item.item}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Buttom */}
      <div className="mt-auto">
        <div 
          className={cn(
            "pt-4 pb-3 transition-all duration-300", 
            isExpanded 
              ? "border-t border-slate-200 dark:border-white/10" 
              : "border-none"
          )}> 
          {organization && (
            <OrganizationSection 
              organization={organization} 
              isExpanded={isExpanded}
            />
          )}
          <div 
            className={cn(
              "py-2 transition-all duration-300", 
              "bg-transparent text-slate-700 dark:text-slate-300",
              isExpanded ? "px-1" : "px-0"
            )}
          >
            <ThemeToggle isCollapsed={!isExpanded} />
          </div>
          <div
            className={cn(
              "transition-all duration-300",
              isExpanded ? 'mt-3 border-t border-slate-200 pt-3 dark:border-white/10' : 'mt-2'
            )}
          >
            <div className={cn(isExpanded ? 'px-1' : 'flex justify-center')}>
              {currentUser && <UserProfileMenu user={currentUser} isCollapsed={!isExpanded} />}
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};

export default memo(Navbar);
