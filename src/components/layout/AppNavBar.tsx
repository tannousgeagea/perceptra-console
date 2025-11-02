
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
import { cn } from '@/lib/utils';
import { UserProfileMenu } from '../users/UserProfileMenu';
import { getCurrentUser } from '@/utils/user';
import { OrganizationSection } from '@/components/organization/OrganizationSection';
import { useAuthHelpers } from '@/hooks/useAuthHelpers';


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
    <div
      className={cn(
        "will-change-[width] transition-[width] duration-300 ease-in-out flex flex-col justify-between font-small text-white h-screen bg-gradient-to-b from-blue-600 via-indigo-500 to-purple-500 text-white",
        isExpanded ? "w-[185px] px-3" : "w-[60px] px-0"
      )}
    >
      <div>
        <div className="w-full mb-4 flex flex-col justify-center items-center py-6 gap-8">
          <button
            className="text-lg cursor-pointer"
            onClick={toggleNavbar}
          >
            {isExpanded ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex flex-row items-center gap-2 text-violet-200">
            <ScanEye className='w-5 h-5 mr-1'/>
            {isExpanded && (
              <h2 
                className="transition-opacity duration-300 truncate"
                style={{ maxWidth: '120px' }}
              >
                Perceptra Vision
              </h2>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 justify-start">
          {items.map((item, index) => (
            <div
              className={cn(
                "transition-all duration-300 p-2 rounded-md",
                isExpanded ? "" : "mx-auto"
              )}
              key={index}
            >
              <Link
                to={item.ref}
                className={cn(
                  "flex items-center text-sm font-medium hover:brightness-110 hover:opacity-70 rounded-md px-2 py-1.5 transition-colors duration-200",
                  isActive(item.ref)
                    ? "bg-white/20 text-white"
                    : "text-white/80"
                )}
              >
                <div className={cn("transition-all duration-300", isExpanded ? "mr-3" : "")}>
                  {item.icon}
                </div>

                {isExpanded && (
                  <span
                    className="transition-opacity duration-300 truncate"
                    style={{ maxWidth: '120px' }}
                  >
                    {item.item}
                  </span>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <div className={cn("pt-4 pb-3 transition-all duration-300", isExpanded ? "border-t border-white/30" : "border-none")}> 
          {organization && <OrganizationSection organization={organization} isExpanded={isExpanded} />}
          <div
            className={cn(
              "p-3 transition-all duration-300",
              isExpanded ? "border-t border-sidebar-border" : "border-none"
            )}
          > 
            <UserProfileMenu user={currentUser} isCollapsed={!isExpanded}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Navbar);
