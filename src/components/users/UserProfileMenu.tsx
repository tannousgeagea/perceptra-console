import { useState } from "react";
import { LogOut, Settings } from "lucide-react";
import { UserAvatar } from "@/components/users/UserAvatar";
import { User as UserType } from "@/types/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/ui/popover";
import { Button } from "@/components/ui/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useAuthHelpers, useCurrentOrganization } from '@/hooks/useAuthHelpers';


interface UserProfileMenuProps {
  user: UserType;
  isCollapsed?: Boolean;
}

export function UserProfileMenu({ user, isCollapsed }: UserProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const helpers = useAuthHelpers();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {isCollapsed ? (
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center px-0 py-3 h-auto hover:bg-inherit hover:brightness-110 hover:opacity-70 rounded-md"
          >
            <UserAvatar user={user} className="h-8 w-8 text-black" />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-start gap-3 px-3 py-2.5 h-auto hover:bg-inherit hover:brightness-110 hover:opacity-70 rounded-md group"
          >
            <UserAvatar user={user} className="h-8 w-8 text-black" />
            <div className="flex flex-col items-start text-left overflow-hidden w-full">
              <span className="text-sm font-medium group-hover:text-sidebar-accent-foreground truncate w-full">
                {user.first_name} {user.last_name}
              </span>
              <span className="text-xs text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground/70 truncate w-full">
                {user.email}
              </span>
            </div>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start" side="top">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="font-medium">{user.first_name} {user.last_name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </div>
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-start text-sm" asChild>
            <a href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </a>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
