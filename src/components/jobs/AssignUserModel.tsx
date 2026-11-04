import { useMemo, useState } from "react";
import { Sparkles, User, Users, X } from "lucide-react";
import { formatHours, useTeamPace } from "@/hooks/useTeamPace";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/ui/dialog";
import { Button } from "@/components/ui/ui/button";
import { ScrollArea } from "@/components/ui/ui/scroll-area";
import { Job } from "@/types/jobs";
import { User as UserType } from '@/types/membership'
import { Input } from "@/components/ui/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/ui/avatar";

interface AssignUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  users: UserType[];
  projectId?: string;
  onAssign: (job: Job, userId: string | null) => void;
}

const AssignUserModal = ({
  isOpen,
  onClose,
  job,
  users,
  projectId,
  onAssign
}: AssignUserModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: teamPace } = useTeamPace(projectId, isOpen);

  // Hours until each person would finish this job: their queue, then this job, at their pace.
  const finishHours = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of teamPace?.members ?? []) {
      if (m.effective_images_per_hour) {
        map.set(m.user_id, (m.open_images + job.image_count) / m.effective_images_per_hour);
      }
    }
    return map;
  }, [teamPace, job.image_count]);
  const paceOf = (userId: string) => teamPace?.members.find((m) => m.user_id === userId);

  // Suggest whoever would finish soonest (only when there is pace to compare).
  const suggestedId = useMemo(() => {
    let best: string | null = null;
    for (const user of users) {
      const hours = finishHours.get(user.id);
      if (hours != null && (best == null || hours < finishHours.get(best)!)) best = user.id;
    }
    return best;
  }, [users, finishHours]);

  // Filter users based on search query; the suggestion first.
  const filteredUsers = users
    .filter((user) => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => Number(b.id === suggestedId) - Number(a.id === suggestedId));

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign User to {job.name}</DialogTitle>
        </DialogHeader>
        
        <div className="my-2">
          <div className="relative mb-4">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-72">
            <div className="space-y-1 pr-3">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                      job.assignedUser?.id === user.id ? "bg-slate-100 dark:bg-slate-800" : ""
                    }`}
                    onClick={() => onAssign(job, user.id)}
                  >
                    <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                      <AvatarFallback className="bg-slate-100 text-slate-700 text-xs dark:bg-slate-800 dark:text-slate-300">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-medium text-sm">
                        {user.username}
                        {user.id === suggestedId && (
                          <span
                            className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600"
                            title="Would finish this job soonest, given their queue and recent pace"
                          >
                            <Sparkles className="h-3 w-3" /> Suggested
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {user.role}
                        {(() => {
                          const m = paceOf(user.id);
                          if (!m) return null;
                          const hours = finishHours.get(user.id);
                          return (
                            <>
                              {" · "}{m.open_images} queued
                              {m.measured && m.images_per_hour ? <> · {m.images_per_hour}/h</> : null}
                              {hours != null && <> · done in {formatHours(hours)}</>}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    {job.assignedUser?.id === user.id && (
                      <div className="ml-auto">
                        <div className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">
                          Assigned
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">
                  <Users className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          {job.assignedUser && (
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onAssign(job, null)}
            >
              <X size={16} className="mr-1" />
              Unassign
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUserModal;