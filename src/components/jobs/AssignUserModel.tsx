import { useState } from "react";
import { User, Users, X } from "lucide-react";
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
  onAssign: (job: Job, userId: string | null) => void;
}

const AssignUserModal = ({ 
  isOpen, 
  onClose, 
  job, 
  users, 
  onAssign 
}: AssignUserModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-slate-100 transition-colors ${
                      job.assignedUser?.id === user.id ? "bg-slate-100" : ""
                    }`}
                    onClick={() => onAssign(job, user.id)}
                  >
                    <Avatar className="h-8 w-8 border border-slate-200">
                      <AvatarFallback className="bg-slate-100 text-slate-700 text-xs">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{user.username}</div>
                      <div className="text-xs text-slate-500">{user.role}</div>
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