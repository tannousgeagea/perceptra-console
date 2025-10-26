import { Organization, OrganizationMember, Project } from "@/types/membership";
import { baseURL } from "../api/base";

export const getUserOrganization = async (): Promise<Organization> => {
  const token = localStorage.getItem("token") || sessionStorage.getItem('token');;

  const response = await fetch(`${baseURL}/api/v1/organizations/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organizations");
  }

  return response.json();
};


export const getOrganizationMembers = async (orgId: string): Promise<OrganizationMember[]> => {
  const token = localStorage.getItem("token") || sessionStorage.getItem('token');

  const response = await fetch(`${baseURL}/api/v1/organizations/${orgId}/members`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organization members");
  }

  return response.json();
};

export const getOrgProjects = async (orgId: string): Promise<Project[]> => {
  const token = localStorage.getItem("token") || sessionStorage.getItem('token');;
  const response = await fetch(`${baseURL}/api/v1/organizations/${orgId}/projects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch organization projects");
  }
  return response.json();
};