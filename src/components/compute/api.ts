import { ComputeProvider, ComputeProfile, ComputeProfileCreateData } from '@/types/compute';

import { Agent, AgentListItem, RegisterAgentResponse, AgentJob } from '@/types/agent'

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
  // Agent APIs
  async getAgents(status?: string): Promise<Agent[]> {
    await delay(800);
    const agents: Agent[] = [
      {
        agent_id: 'agent-001',
        name: 'GPU Workstation 1',
        status: 'ready',
        is_online: true,
        gpu_count: 2,
        gpu_info: [
          { name: 'NVIDIA RTX 4090', memory_total: 24576, memory_free: 20480, uuid: 'GPU-001', cuda_compute_capability: '8.9' },
          { name: 'NVIDIA RTX 4090', memory_total: 24576, memory_free: 22000, uuid: 'GPU-002', cuda_compute_capability: '8.9' },
        ],
        system_info: {
          os: 'Ubuntu 22.04',
          cpu_count: 32,
          memory_total: 131072,
          python_version: '3.10.12',
          cuda_version: '12.1',
          docker_version: '24.0.5',
        },
        active_jobs: 0,
        max_concurrent_jobs: 4,
        completed_jobs: 45,
        failed_jobs: 2,
        last_heartbeat: new Date(Date.now() - 15000).toISOString(),
        uptime_seconds: 86400 * 3,
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        agent_id: 'agent-002',
        name: 'Training Server',
        status: 'busy',
        is_online: true,
        gpu_count: 4,
        gpu_info: [
          { name: 'NVIDIA A100 80GB', memory_total: 81920, memory_free: 40960, uuid: 'GPU-003', cuda_compute_capability: '8.0' },
          { name: 'NVIDIA A100 80GB', memory_total: 81920, memory_free: 81920, uuid: 'GPU-004', cuda_compute_capability: '8.0' },
          { name: 'NVIDIA A100 80GB', memory_total: 81920, memory_free: 81920, uuid: 'GPU-005', cuda_compute_capability: '8.0' },
          { name: 'NVIDIA A100 80GB', memory_total: 81920, memory_free: 81920, uuid: 'GPU-006', cuda_compute_capability: '8.0' },
        ],
        system_info: {
          os: 'Ubuntu 20.04',
          cpu_count: 64,
          memory_total: 524288,
          python_version: '3.9.16',
          cuda_version: '11.8',
          docker_version: '23.0.6',
        },
        active_jobs: 2,
        max_concurrent_jobs: 8,
        completed_jobs: 128,
        failed_jobs: 5,
        last_heartbeat: new Date(Date.now() - 5000).toISOString(),
        uptime_seconds: 86400 * 14,
        created_at: '2024-02-01T08:00:00Z',
      },
      {
        agent_id: 'agent-003',
        name: 'Dev Machine',
        status: 'offline',
        is_online: false,
        gpu_count: 1,
        gpu_info: [
          { name: 'NVIDIA RTX 3080', memory_total: 10240, memory_free: 0, uuid: 'GPU-007', cuda_compute_capability: '8.6' },
        ],
        system_info: {
          os: 'Windows 11',
          cpu_count: 16,
          memory_total: 65536,
          python_version: '3.11.4',
          cuda_version: '12.0',
          docker_version: '24.0.2',
        },
        active_jobs: 0,
        max_concurrent_jobs: 2,
        completed_jobs: 12,
        failed_jobs: 1,
        last_heartbeat: new Date(Date.now() - 3600000).toISOString(),
        uptime_seconds: 0,
        created_at: '2024-03-01T14:00:00Z',
      },
    ];

    if (status) {
      return agents.filter(a => a.status === status);
    }
    return agents;
  },

  async getAgentStats(agentId: string): Promise<Agent> {
    await delay(500);
    const agents = await this.getAgents();
    const agent = agents.find(a => a.agent_id === agentId);
    if (!agent) throw new Error('Agent not found');
    return agent;
  },

  async getAgentJobs(agentId: string): Promise<AgentJob[]> {
    await delay(400);
    if (agentId === 'agent-002') {
      return [
        {
          job_id: 'job-001',
          training_session_id: 'ts-001',
          model_version_id: 'mv-001',
          status: 'running',
          progress: 67.5,
          framework: 'PyTorch',
          task: 'Object Detection',
          started_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          job_id: 'job-002',
          training_session_id: 'ts-002',
          model_version_id: 'mv-002',
          status: 'running',
          progress: 23.1,
          framework: 'PyTorch',
          task: 'Image Classification',
          started_at: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
    }
    return [];
  },

  async registerAgent(data: { name: string; gpu_info: any[]; system_info: any }): Promise<RegisterAgentResponse> {
    await delay(1200);
    const agentId = `agent-${Math.random().toString(36).substr(2, 9)}`;
    return {
      agent_id: agentId,
      name: data.name,
      api_key: `key_${Math.random().toString(36).substr(2, 16)}`,
      secret_key: `secret_${Math.random().toString(36).substr(2, 32)}`,
      install_command: `curl -fsSL https://platform.example.com/agents/install.sh | bash -s -- --api-url https://api.platform.example.com --key key_abc123 --secret secret_xyz789 --id ${agentId}`,
      status: 'pending',
    };
  },

  async deleteAgent(agentId: string): Promise<void> {
    await delay(600);
  },

  async regenerateAgentKey(agentId: string): Promise<RegisterAgentResponse> {
    await delay(800);
    return {
      agent_id: agentId,
      name: 'Agent',
      api_key: `key_${Math.random().toString(36).substr(2, 16)}`,
      secret_key: `secret_${Math.random().toString(36).substr(2, 32)}`,
      install_command: `curl -fsSL https://platform.example.com/agents/install.sh | bash -s -- --api-url https://api.platform.example.com --key key_newkey --secret secret_newsecret --id ${agentId}`,
      status: 'ready',
    };
  },

  async revokeAgentKey(keyId: string): Promise<void> {
    await delay(500);
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
