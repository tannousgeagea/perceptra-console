import { StorageProfile, StorageBackend } from '@/types/storage';
import { User, InviteUserData } from "@/types/auth"

// Mock API responses for development
export const api = {
  // Storage Profile APIs
  async getStorageProfiles(): Promise<StorageProfile[]> {
    await delay(800);
    return [
      {
        storage_profile_id: '1',
        name: 'Production Azure Storage',
        backend: 'azure',
        region: 'eastus',
        is_default: true,
        created_at: '2024-01-15',
        config: {
          containerName: 'cv-platform-prod',
          basePath: '/datasets',
          description: 'Primary storage for production data',
        },
      },
      {
        storage_profile_id: '2',
        name: 'Development S3 Bucket',
        backend: 's3',
        region: 'us-west-2',
        is_default: false,
        created_at: '2024-02-10',
        config: {
          bucketName: 'cv-dev-bucket',
          accessKey: 'AKIA...',
          secretKey: '****',
          region: 'us-west-2',
          description: 'Development and testing storage',
        },
      },
    ] as StorageProfile[];
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
        username: 'sarah.j',
        email: 'sarah.j@company.com',
        role: 'owner',
        status: 'active',
        createdAt: '2023-12-01',
        last_active: '2024-03-15',
        avatar: '',
        organizations: [],
      },
      {
        id: '2',
        first_name: 'Michael',
        last_name: 'Chen',
        username: 'michael.c',
        email: 'michael.c@company.com',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-10',
        last_active: '2024-03-14',
        avatar: '',
        organizations: [],
      },
      {
        id: '3',
        first_name: 'Emily',
        last_name: 'Rodriguez',
        username: 'emily.r',
        email: 'emily.r@company.com',
        role: 'annotator',
        status: 'active',
        createdAt: '2024-02-05',
        last_active: '2024-03-13',
        avatar: '',
        organizations: [],
      },
      {
        id: '4',
        first_name: 'David',
        last_name: 'Kim',
        username: 'david.k',
        email: 'david.k@company.com',
        role: 'viewer',
        status: 'active',
        createdAt: '2024-02-20',
        last_active: '2024-03-10',
        avatar: '',
        organizations: [],
      },
      {
        id: '5',
        first_name: 'Jessica',
        last_name: 'Brown',
        username: 'jessica.b',
        email: 'jessica.b@company.com',
        role: 'annotator',
        status: 'pending',
        createdAt: '2024-03-12',
        last_active: '',
        avatar: '',
        organizations: [],
      },
    ];
  },

  async inviteUser(data: InviteUserData): Promise<User> {
    await delay(1000);
    return {
      id: Math.random().toString(36).substr(2, 9),
      username: data.email.split('@')[0],
      first_name: '',
      last_name: '',
      email: data.email,
      role: data.role,
      status: 'pending',
      createdAt: new Date().toISOString(),
      last_active: '',
      avatar: '',
      organizations: [],
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
