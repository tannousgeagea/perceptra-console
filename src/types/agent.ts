// Agent Types
export type AgentStatus = 'ready' | 'busy' | 'offline' | 'error' | 'pending';

export interface GPUInfo {
  name: string;
  memory_total: number;
  memory_free: number;
  uuid: string;
  cuda_compute_capability?: string;
}

export interface SystemInfo {
  os: string;
  cpu_count: number;
  memory_total: number;
  python_version: string;
  cuda_version?: string;
  docker_version?: string;
}

export interface Agent {
  agent_id: string;
  name: string;
  status: AgentStatus;
  is_online: boolean;
  gpu_count: number;
  gpu_info: GPUInfo[];
  system_info: SystemInfo;
  active_jobs: number;
  max_concurrent_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  last_heartbeat?: string;
  uptime_seconds?: number;
  created_at: string;
}

export interface AgentListItem {
  agent_id: string;
  name: string;
  status: AgentStatus;
  is_online: boolean;
  gpu_count: number;
  gpu_info: GPUInfo[];
  system_info: SystemInfo;
  active_jobs: number;
  max_concurrent_jobs: number;
  last_heartbeat?: string;
  uptime_seconds?: number;
  completed_jobs: number;
  failed_jobs: number;
  created_at: string;
}

export interface RegisterAgentRequest {
  name: string;
  gpu_info: GPUInfo[];
  system_info: SystemInfo;
}

export interface RegisterAgentResponse {
  agent_id: string;
  name: string;
  api_key: string;
  secret_key: string;
  install_command: string;
  status: AgentStatus;
}

export interface AgentJob {
  job_id: string;
  training_session_id?: string;
  model_version_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  framework?: string;
  task?: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
}