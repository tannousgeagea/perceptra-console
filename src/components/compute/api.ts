import { ComputeProvider, ComputeProfile, ComputeProfileCreateData } from '@/types/compute';

// Mock API responses for development
export const api = {

  // Compute Profile APIs
  async getComputeProviders(): Promise<ComputeProvider[]> {
    await delay(600);
    return [
      {
        id: 1,
        name: 'Platform GPU Workers',
        provider_type: 'platform-gpu',
        description: 'High-performance GPU instances managed by the platform',
        requires_user_credentials: false,
        is_active: true,
        available_instances: [
          { name: 'gpu-small', vcpus: 4, memory_gb: 16, gpu_type: 'NVIDIA T4', gpu_count: 1, cost_per_hour: 0.50 },
          { name: 'gpu-medium', vcpus: 8, memory_gb: 32, gpu_type: 'NVIDIA A10G', gpu_count: 1, cost_per_hour: 1.20 },
          { name: 'gpu-large', vcpus: 16, memory_gb: 64, gpu_type: 'NVIDIA A100', gpu_count: 1, cost_per_hour: 3.50 },
          { name: 'gpu-xlarge', vcpus: 32, memory_gb: 128, gpu_type: 'NVIDIA A100', gpu_count: 4, cost_per_hour: 12.00 },
        ],
      },
      {
        id: 2,
        name: 'Platform CPU Workers',
        provider_type: 'platform-cpu',
        description: 'Cost-effective CPU instances for lighter workloads',
        requires_user_credentials: false,
        is_active: true,
        available_instances: [
          { name: 'cpu-small', vcpus: 2, memory_gb: 4, gpu_count: 0, cost_per_hour: 0.05 },
          { name: 'cpu-medium', vcpus: 4, memory_gb: 16, gpu_count: 0, cost_per_hour: 0.12 },
          { name: 'cpu-large', vcpus: 8, memory_gb: 32, gpu_count: 0, cost_per_hour: 0.25 },
        ],
      },
      {
        id: 3,
        name: 'AWS SageMaker',
        provider_type: 'aws-sagemaker',
        description: 'Fully managed ML service with auto-scaling capabilities',
        requires_user_credentials: true,
        is_active: true,
        available_instances: [
          { name: 'ml.g4dn.xlarge', vcpus: 4, memory_gb: 16, gpu_type: 'NVIDIA T4', gpu_count: 1, cost_per_hour: 0.73 },
          { name: 'ml.g5.2xlarge', vcpus: 8, memory_gb: 32, gpu_type: 'NVIDIA A10G', gpu_count: 1, cost_per_hour: 1.52 },
          { name: 'ml.p4d.24xlarge', vcpus: 96, memory_gb: 1152, gpu_type: 'NVIDIA A100', gpu_count: 8, cost_per_hour: 37.69 },
        ],
      },
      {
        id: 4,
        name: 'GCP Vertex AI',
        provider_type: 'gcp-vertex',
        description: 'Google Cloud AI platform with TPU support',
        requires_user_credentials: true,
        is_active: true,
        available_instances: [
          { name: 'n1-highmem-4-t4', vcpus: 4, memory_gb: 26, gpu_type: 'NVIDIA T4', gpu_count: 1, cost_per_hour: 0.65 },
          { name: 'a2-highgpu-1g', vcpus: 12, memory_gb: 85, gpu_type: 'NVIDIA A100', gpu_count: 1, cost_per_hour: 4.01 },
        ],
      },
      {
        id: 5,
        name: 'Azure ML',
        provider_type: 'azure-ml',
        description: 'Microsoft Azure machine learning compute',
        requires_user_credentials: true,
        is_active: true,
        available_instances: [
          { name: 'Standard_NC4as_T4_v3', vcpus: 4, memory_gb: 28, gpu_type: 'NVIDIA T4', gpu_count: 1, cost_per_hour: 0.53 },
          { name: 'Standard_NC24ads_A100_v4', vcpus: 24, memory_gb: 220, gpu_type: 'NVIDIA A100', gpu_count: 1, cost_per_hour: 3.67 },
        ],
      },
      {
        id: 6,
        name: 'RunPod',
        provider_type: 'runpod',
        description: 'On-demand GPU cloud with competitive pricing',
        requires_user_credentials: true,
        is_active: true,
        available_instances: [
          { name: 'RTX 3090', vcpus: 8, memory_gb: 24, gpu_type: 'NVIDIA RTX 3090', gpu_count: 1, cost_per_hour: 0.44 },
          { name: 'RTX 4090', vcpus: 16, memory_gb: 48, gpu_type: 'NVIDIA RTX 4090', gpu_count: 1, cost_per_hour: 0.69 },
          { name: 'A100 80GB', vcpus: 32, memory_gb: 128, gpu_type: 'NVIDIA A100 80GB', gpu_count: 1, cost_per_hour: 1.99 },
        ],
      },
      {
        id: 7,
        name: 'On-Premise Agent',
        provider_type: 'on-premise-agent',
        description: 'Connect your own GPU infrastructure',
        requires_user_credentials: false,
        is_active: true,
        available_instances: [
          { name: 'custom', vcpus: 0, memory_gb: 0, gpu_count: 0 },
        ],
      },
    ];
  },

  async getComputeProfiles(): Promise<ComputeProfile[]> {
    await delay(800);
    return [
      {
        id: 'cp-1',
        name: 'Production Training',
        provider: {
          id: 1,
          name: 'Platform GPU Workers',
          provider_type: 'platform-gpu',
          description: 'High-performance GPU instances',
          requires_user_credentials: false,
          is_active: true,
          available_instances: [],
        },
        default_instance_type: 'gpu-large',
        strategy: 'fastest',
        max_concurrent_jobs: 10,
        max_cost_per_hour: 50,
        max_training_hours: 48,
        has_credentials: false,
        is_active: true,
        is_default: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-03-10T14:30:00Z',
      },
      {
        id: 'cp-2',
        name: 'Development & Testing',
        provider: {
          id: 2,
          name: 'Platform CPU Workers',
          provider_type: 'platform-cpu',
          description: 'Cost-effective CPU instances',
          requires_user_credentials: false,
          is_active: true,
          available_instances: [],
        },
        default_instance_type: 'cpu-medium',
        strategy: 'cheapest',
        max_concurrent_jobs: 3,
        max_cost_per_hour: 5,
        max_training_hours: 12,
        has_credentials: false,
        is_active: true,
        is_default: false,
        created_at: '2024-02-20T09:00:00Z',
        updated_at: '2024-02-20T09:00:00Z',
      },
    ];
  },

  async createComputeProfile(data: ComputeProfileCreateData): Promise<ComputeProfile> {
    await delay(1000);
    const providers = await api.getComputeProviders();
    const provider = providers.find(p => p.id === data.provider_id);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      provider: provider || providers[0],
      default_instance_type: data.default_instance_type,
      strategy: data.strategy,
      max_concurrent_jobs: data.max_concurrent_jobs || 5,
      max_cost_per_hour: data.max_cost_per_hour,
      max_training_hours: data.max_training_hours || 24,
      has_credentials: false,
      is_active: true,
      is_default: data.is_default || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  async updateComputeProfile(id: string, updates: Partial<ComputeProfile>): Promise<ComputeProfile> {
    await delay(800);
    return {
      id,
      ...updates,
      updated_at: new Date().toISOString(),
    } as ComputeProfile;
  },

  async deleteComputeProfile(id: string): Promise<void> {
    await delay(500);
  },

  async testComputeConnection(providerId: number): Promise<{ success: boolean; message: string }> {
    await delay(1500);
    const success = Math.random() > 0.2;
    return {
      success,
      message: success
        ? 'Successfully connected to compute provider'
        : 'Failed to connect: Please verify your credentials',
    };
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
