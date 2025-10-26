import { Job } from "@/types/jobs";
import { User } from "@/types/membership";
import { baseURL } from "../api/base";

export const getProjectJob = async (projectId: string): Promise<Job[]> => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${baseURL}/api/v1/projects/${projectId}/jobs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch organization projects");
  }
  return response.json();
};