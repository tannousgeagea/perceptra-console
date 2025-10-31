import { StorageProfile, StorageBackend } from '@/types/storage';
import { User, InviteUserData } from "@/types/auth"

// Mock API responses for development
export const api = {
  // Storage Profile APIs
  async getStorageProfiles(): Promise<StorageProfile[]> {
    await delay(800);
    return [
      {
        id: '1',
        name: 'Production Azure Storage',
        backend: 'azure',
        region: 'eastus',
        isDefault: true,
        createdAt: '2024-01-15',
        config: {
          containerName: 'cv-platform-prod',
          basePath: '/datasets',
          description: 'Primary storage for production data',
        },
      },
      {
        id: '2',
        name: 'Development S3 Bucket',
        backend: 's3',
        region: 'us-west-2',
        isDefault: false,
        createdAt: '2024-02-10',
        config: {
          bucketName: 'cv-dev-bucket',
          accessKey: 'AKIA...',
          secretKey: '****',
          region: 'us-west-2',
          description: 'Development and testing storage',
        },
      },
    ];
  },

  async createStorageProfile(profile: Partial<StorageProfile>): Promise<StorageProfile> {
    await delay(1000);
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: profile.name || 'New Storage',
      backend: profile.backend || 'azure',
      isDefault: false,
      createdAt: new Date().toISOString(),
      config: profile.config || {},
    } as StorageProfile;
  },

  async updateStorageProfile(id: string, profile: Partial<StorageProfile>): Promise<StorageProfile> {
    await delay(800);
    return {
      id,
      ...profile,
    } as StorageProfile;
  },

  async deleteStorageProfile(id: string): Promise<void> {
    await delay(500);
  },

  async testConnection(backend: StorageBackend, config: any): Promise<{ success: boolean; message: string }> {
    await delay(1500);
    // Simulate success most of the time
    const success = Math.random() > 0.2;
    return {
      success,
      message: success
        ? `Successfully connected to ${backend} storage`
        : `Failed to connect: Invalid credentials or configuration`,
    };
  },

  // User Management APIs
  async getUsers(): Promise<User[]> {
    await delay(600);
    return [
      {
        id: '1',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.j@company.com',
        role: 'Owner',
        status: 'active',
        createdAt: '2023-12-01',
        lastActive: '2024-03-15',
      },
      {
        id: '2',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'michael.c@company.com',
        role: 'Admin',
        status: 'active',
        createdAt: '2024-01-10',
        lastActive: '2024-03-14',
      },
      {
        id: '3',
        first_name: 'Emily',
        last_name: 'Rodriguez',
        email: 'emily.r@company.com',
        role: 'Annotator',
        status: 'active',
        createdAt: '2024-02-05',
        lastActive: '2024-03-13',
      },
      {
        id: '4',
        first_name: 'David',
        last_name: 'Kim',
        email: 'david.k@company.com',
        role: 'Viewer',
        status: 'active',
        createdAt: '2024-02-20',
        lastActive: '2024-03-10',
      },
      {
        id: '5',
        first_name: 'Jessica',
        last_name: 'Brown',
        email: 'jessica.b@company.com',
        role: 'Annotator',
        status: 'pending',
        createdAt: '2024-03-12',
      },
    ];
  },

  async inviteUser(data: InviteUserData): Promise<User> {
    await delay(1000);
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: data.email.split('@')[0],
      email: data.email,
      role: data.role,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await delay(800);
    return {
      id,
      ...updates,
    } as User;
  },

  async deleteUser(id: string): Promise<void> {
    await delay(500);
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
