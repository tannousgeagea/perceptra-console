

// Compute Types
export type ComputeProviderType = 
  | 'platform-gpu' 
  | 'platform-cpu' 
  | 'on-premise-agent' 
  | 'aws-sagemaker' 
  | 'gcp-vertex' 
  | 'azure-ml' 
  | 'kubernetes' 
  | 'modal' 
  | 'runpod';

export type ComputeStrategy = 'cheapest' | 'fastest' | 'preferred' | 'queue';

export interface ComputeInstanceInfo {
  name: string;
  vcpus: number;
  memory_gb: number;
  gpu_type?: string;
  gpu_count: number;
  cost_per_hour?: number;
}

export interface ComputeProvider {
  id: number;
  name: string;
  provider_type: ComputeProviderType;
  description: string;
  requires_user_credentials: boolean;
  is_active: boolean;
  available_instances: ComputeInstanceInfo[];
}

export interface ComputeProfile {
  id: string;
  name: string;
  provider: ComputeProvider;
  default_instance_type: string;
  strategy: ComputeStrategy;
  max_concurrent_jobs: number;
  max_cost_per_hour?: number;
  max_training_hours: number;
  has_credentials: boolean;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComputeProfileCreateData {
  name: string;
  provider_id: number;
  default_instance_type: string;
  strategy: ComputeStrategy;
  max_concurrent_jobs?: number;
  max_cost_per_hour?: number;
  max_training_hours?: number;
  is_default?: boolean;
  user_credentials?: ComputeCredentials;
}

// Credential types for different providers
export interface AWSCredentials {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  role_arn?: string;
}

export interface GCPCredentials {
  project_id: string;
  service_account_json: string;
  region: string;
}

export interface AzureCredentials {
  subscription_id: string;
  tenant_id: string;
  client_id: string;
  client_secret: string;
  resource_group: string;
}

export interface RunpodCredentials {
  api_key: string;
}

export interface ModalCredentials {
  token_id: string;
  token_secret: string;
}

export interface KubernetesCredentials {
  kubeconfig: string;
  namespace?: string;
}

export interface OnPremiseCredentials {
  agent_token: string;
  endpoint_url: string;
}

export type ComputeCredentials = 
  | AWSCredentials 
  | GCPCredentials 
  | AzureCredentials 
  | RunpodCredentials 
  | ModalCredentials 
  | KubernetesCredentials 
  | OnPremiseCredentials;


export interface CredentialField {
  key: string;
  label: string;
  secret: boolean;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
}


//////////////////////////////////////////
// Responses
//////////////////////////////////////////

export interface ComputeProfileUpdateRequest {
  name?: string;
  default_instance_type?: string;
  strategy?: string;
  max_concurrent_jobs?: number;
  max_cost_per_hour?: number;
  max_training_hours?: number;
  user_credentials?: Record<string, any>;
  is_active?: boolean;
  is_default?: boolean;
}

export interface FallbackProviderRequest {
  provider_id: number;
  priority: number;
}

export interface CredentialValidationResponse {
  valid: boolean;
  message: string;
  error?: string;
  details?: Record<string, any>;
}

export interface TrainingRecommendation {
  profile_id: string;
  name: string;
  provider: string;
  provider_type: string;
  instance_type: string;
  score: number;
  reasons: string[];
  is_default: boolean;
  estimated_cost_per_hour?: number;
}

export interface TrainingRecommendationsResponse {
  recommendations: TrainingRecommendation[];
  suggestion?: TrainingRecommendation;
}

export interface TrainingRecommendationsParams {
  model_size_mb?: number;
  dataset_size_gb?: number;
}
