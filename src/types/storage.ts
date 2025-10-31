export type StorageBackend = 'azure' | 's3' | 'minio' | 'local';

export type CredentialType = 'connection_string' | 'account_key' | 'access_key' | 'external';

export interface ConnectionStringCredentials {
  type: 'connection_string';
  connection_string: string;
}

export interface AccountKeyCredentials {
  type: 'account_key';
  account_key: string;
}

export interface AccessKeyCredentials {
  type: 'access_key';
  access_key_id: string;
  secret_access_key: string;
}

export type Credentials = ConnectionStringCredentials | AccountKeyCredentials | AccessKeyCredentials;


export interface StorageProfile {
  storage_profile_id?: string;
  name: string;
  backend: StorageBackend;
  region?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?:string;
  config: AzureConfig | S3Config | MinioConfig | LocalConfig;
}

export interface StorageSecret {
  id: number;
  credential_ref_id: string;
  provider: string;
  path: string;
  key: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}


export interface AzureConfig {
  containerName: string;
  connectionString?: string;
  accountKey?: string;
  basePath?: string;
  encryptionKey?: string;
  description?: string;
}

export interface S3Config {
  bucketName: string;
  accessKey: string;
  secretKey: string;
  region: string;
  basePath?: string;
  kmsKeyId?: string;
  description?: string;
}

export interface MinioConfig {
  endpointUrl: string;
  bucketName: string;
  accessKey: string;
  secretKey: string;
  basePath?: string;
  description?: string;
}

export interface LocalConfig {
  basePath: string;
  description?: string;
}
