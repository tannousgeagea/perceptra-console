import { User, Role } from "./membership";

export enum JobStatus {
    UNASSIGNED = "unassigned",
    ASSIGNED = "assigned",
    IN_REVIEW = "in_review",
    COMPLETED = "completed",
  }
  

export interface ProjectMember extends User {
  role: Role
}

export interface JobProgress {
  total: number;
  annotated: number;
  reviewed: number;
  completed: number;
}

export interface Job {
    id: string;
    name: string;
    description?: string;
    status: JobStatus;
    imageCount: number;
    assignedUser: User | null;
    createdAt: Date;
    updatedAt: Date;
    parentJobId?: string;
    sliceNumber?: number;
    projectId?: string;
    progress?: JobProgress;   // 👈 new
  }

  export type AllowedTransition = {
    from: JobStatus;
    to: JobStatus[];
  };
  
  export const allowedStatusTransitions: AllowedTransition[] = [
    {
      from: JobStatus.ASSIGNED,
      to: [JobStatus.IN_REVIEW],
    },
    {
      from: JobStatus.IN_REVIEW,
      to: [JobStatus.ASSIGNED, JobStatus.COMPLETED],
    },
  ];
  