import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/ui/avatar";
import { User } from "@/types/membership";

interface UserAvatarProps {
  user: User;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const initials = user.username
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={className}>
      <AvatarImage src={user.avatar} alt={user.username} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}