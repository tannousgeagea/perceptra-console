import { Organization, OrganizationMember, Project, ProjectMember, Role, UserProfile } from '@/types/membership';

// Mock Organizations
export const organizations: Organization[] = [
  { id: 'org-1', name: 'WasteAnt GmbH', userCount: 24, projectCount: 8 },
  { id: 'org-2', name: 'Startup Labs', userCount: 7, projectCount: 3 },
  { id: 'org-3', name: 'Research Institute', userCount: 15, projectCount: 6 }
];

// Mock Projects
export const projects: Project[] = [
  { id: 'proj-1', name: 'Website Redesign', organizationId: 'org-1', memberCount: 5 },
  { id: 'proj-2', name: 'Mobile App', organizationId: 'org-1', memberCount: 8 },
  { id: 'proj-3', name: 'Data Analytics', organizationId: 'org-1', memberCount: 4 },
  { id: 'proj-4', name: 'Marketing Campaign', organizationId: 'org-2', memberCount: 3 },
  { id: 'proj-5', name: 'Research Paper', organizationId: 'org-3', memberCount: 6 }
];

// Mock Users
export const users = [
  { id: 'user-1', username: 'John Doe', email: 'john@example.com', avatar: 'https://ui-avatars.com/api/?username=John+Doe' },
  { id: 'user-2', username: 'Jane Smith', email: 'jane@example.com', avatar: 'https://ui-avatars.com/api/?username=Jane+Smith' },
  { id: 'user-3', username: 'Robert Johnson', email: 'robert@example.com', avatar: 'https://ui-avatars.com/api/?username=Robert+Johnson' },
  { id: 'user-4', username: 'Emily Davis', email: 'emily@example.com', avatar: 'https://ui-avatars.com/api/?username=Emily+Davis' },
  { id: 'user-5', username: 'Michael Wilson', email: 'michael@example.com', avatar: 'https://ui-avatars.com/api/?username=Michael+Wilson' },
  { id: 'user-6', username: 'Sarah Brown', email: 'sarah@example.com', avatar: 'https://ui-avatars.com/api/?username=Sarah+Brown' },
  { id: 'user-7', username: 'David Miller', email: 'david@example.com', avatar: 'https://ui-avatars.com/api/?username=David+Miller' },
  { id: 'user-8', username: 'Jennifer Garcia', email: 'jennifer@example.com', avatar: 'https://ui-avatars.com/api/?username=Jennifer+Garcia' }
];

// Mock Project Memberships
export const projectMemberships = [
  { projectId: 'proj-1', userId: 'user-1', role: 'admin' as Role, organizationId: 'org-1' },
  { projectId: 'proj-1', userId: 'user-2', role: 'editor' as Role, organizationId: 'org-1' },
  { projectId: 'proj-1', userId: 'user-3', role: 'viewer' as Role, organizationId: 'org-1' },
  { projectId: 'proj-2', userId: 'user-1', role: 'editor' as Role, organizationId: 'org-1' },
  { projectId: 'proj-2', userId: 'user-4', role: 'admin' as Role, organizationId: 'org-1' },
  { projectId: 'proj-3', userId: 'user-2', role: 'admin' as Role, organizationId: 'org-1' },
  { projectId: 'proj-4', userId: 'user-5', role: 'admin' as Role, organizationId: 'org-2' },
  { projectId: 'proj-4', userId: 'user-6', role: 'editor' as Role, organizationId: 'org-2' },
  { projectId: 'proj-5', userId: 'user-7', role: 'admin' as Role, organizationId: 'org-3' },
  { projectId: 'proj-5', userId: 'user-8', role: 'viewer' as Role, organizationId: 'org-3' }
];

// Helper function to generate mock data
export function getOrganizationMembers(orgId: string): OrganizationMember[] {
  const orgProjects = projects.filter(project => project.organizationId === orgId);
  const orgMemberships = projectMemberships.filter(pm => pm.organizationId === orgId);
  
  // Get unique user IDs from memberships
  const orgUserIds = [...new Set(orgMemberships.map(membership => membership.userId))];
  
  // Get full user details for each user ID
  return orgUserIds.map(userId => {
    const user = users.find(u => u.id === userId)!;
    const userMemberships = orgMemberships.filter(membership => membership.userId === userId);
    
    return {
      ...user,
      projects: userMemberships,
    };
  });
}

export function getProjectMembers(projectId: string): ProjectMember[] {
  const projectUserIds = projectMemberships
    .filter(pm => pm.projectId === projectId)
    .map(pm => ({ userId: pm.userId, role: pm.role }));
  
  return projectUserIds.map(({ userId, role }) => {
    const user = users.find(u => u.id === userId)!;
    return {
      ...user,
      role,
    };
  });
}

export function getUserProfile(userId: string): UserProfile {
  const user = users.find(u => u.id === userId)!;
  
  // Get all organizations the user is a member of
  const userMemberships = projectMemberships.filter(pm => pm.userId === userId);
  const userOrgIds = [...new Set(userMemberships.map(membership => membership.organizationId))];
  
  const userOrganizations = userOrgIds.map(orgId => {
    const organization = organizations.find(org => org.id === orgId)!;
    const orgProjects = projects.filter(project => 
      project.organizationId === orgId && 
      userMemberships.some(membership => membership.projectId === project.id)
    );
    
    return {
      organization,
      projects: orgProjects,
    };
  });
  
  const userProjectMemberships = userMemberships.map(membership => {
    const project = projects.find(p => p.id === membership.projectId)!;
    const organization = organizations.find(org => org.id === membership.organizationId)!;
    
    return {
      project,
      role: membership.role,
      organization,
    };
  });
  
  return {
    ...user,
    organizations: userOrganizations,
    projectMemberships: userProjectMemberships,
  };
}

// Mock API service that uses the mock data
export const mockApi = {
  getOrganization: (orgId: string) => {
    return Promise.resolve(organizations.find(org => org.id === orgId)!);
  },
  getOrganizationMembers: (orgId: string) => {
    return Promise.resolve(getOrganizationMembers(orgId));
  },
  getProjectMembers: (projectId: string) => {
    return Promise.resolve(getProjectMembers(projectId));
  },
  addProjectMember: (projectId: string, userId: string, role: string) => {
    return Promise.resolve();
  },
  updateProjectMemberRole: (projectId: string, userId: string, role: string) => {
    return Promise.resolve();
  },
  removeProjectMember: (projectId: string, userId: string) => {
    return Promise.resolve();
  },
  getUserProfile: (userId: string) => {
    return Promise.resolve(getUserProfile(userId));
  }
};