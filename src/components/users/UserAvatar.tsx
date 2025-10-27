// components/UserAvatar.tsx - Optimized version

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/ui/avatar";
import { User } from "@/types/auth";
import { getUserFullName } from "@/types/auth";

interface UserAvatarProps {
  user?: User | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  fallbackColor?: string;
}

/**
 * Optimized UserAvatar component
 * - No longer needs useAuthHelpers hook (less overhead)
 * - Memoized initials calculation
 * - Better fallback handling
 * - Optional size variants
 * - Color-coded fallback based on user
 */
export function UserAvatar({ 
  user, 
  className = '',
  size = 'md',
  showStatus = false,
  fallbackColor,
}: UserAvatarProps) {
  
  // ✅ Memoized calculations - only recalculate when user changes
  const { initials, fullName, avatarColor } = useMemo(() => {
    if (!user) {
      return {
        initials: '?',
        fullName: 'Unknown User',
        avatarColor: 'bg-gray-500',
      };
    }

    const name = getUserFullName(user);
    const userInitials = name
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || user.email[0].toUpperCase();

    // Generate consistent color based on user email (same user = same color)
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const colorIndex = user.email.charCodeAt(0) % colors.length;
    const color = fallbackColor || colors[colorIndex];

    return {
      initials: userInitials,
      fullName: name,
      avatarColor: color,
    };
  }, [user, fallbackColor]);

  // Size variants
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        {/* Avatar image - only shown if user has an avatar URL */}
        {user?.avatar && (
          <AvatarImage 
            src={user.avatar} 
            alt={fullName}
            loading="lazy"
          />
        )}
        
        {/* Fallback with initials and colored background */}
        <AvatarFallback className={`${avatarColor} text-white font-semibold`}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Optional status indicator */}
      {showStatus && user && (
        <span 
          className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
          title="Online"
        />
      )}
    </div>
  );
}