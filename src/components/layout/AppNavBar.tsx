
import { memo } from 'react'
import { FC, useState, useEffect, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Menu,
  Folder,
  Database,
  Upload,
  Brain,
  Rocket,
  ScanEye,
  Scan,
} from 'lucide-react';
import { MTXLogo } from '../logo/mtx';
import { cn } from '@/lib/utils';
import { UserProfileMenu } from '../users/UserProfileMenu';
import { getCurrentUser } from '@/utils/user';
import { OrganizationSection } from '@/components/organization/OrganizationSection';
import { useAuthHelpers } from '@/hooks/useAuthHelpers';
import { ThemeToggle } from '@/components/theme/ThemeToggle';


interface NavbarItem {
  item: string;
  ref: string;
  icon: ReactNode;
}

const Navbar: FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const location = useLocation();
  const helpers = useAuthHelpers();

  useEffect(() => {
    if (location.pathname.includes('/projects/')) {
      setIsExpanded(false);
    }
  }, [location.pathname]);

  const organization = helpers.getPrimaryOrganization()
  const currentUser = getCurrentUser();

  const items: NavbarItem[] = [
    { item: "Projects", ref: "/projects", icon: <Folder size={20} /> },
    { item: "Datalake", ref: "/datalake", icon: <Database size={20} /> },
    { item: "Upload", ref: "/upload", icon: <Upload size={20} /> },
    { item: "Inference", ref: "/inference", icon: <Scan size={20} /> },
    { item: "Models", ref: "/models", icon: <Brain size={20} /> },
    { item: "Deploy", ref: "/deploy", icon: <Rocket size={20} /> },
  ];

  const toggleNavbar = (): void => {
    setIsExpanded(!isExpanded);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'flex h-screen flex-col justify-between border-r will-change-[width] transition-[width] duration-300 ease-in-out',
        "bg-[var(--mtx-bg)] text-[var(--mtx-text)] border-[var(--mtx-border)]",
        isExpanded ? 'w-[210px] px-3' : 'w-[68px] px-2'
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
              className='h-12 w-auto'
              compact={!isExpanded}
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
              <UserProfileMenu user={currentUser} isCollapsed={!isExpanded} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default memo(Navbar);
