export type StorageBackend = 'azure' | 's3' | 'minio' | 'gcs' | 'local';

/**
 * managed: Perceptra writes and deletes files in this storage.
 * external_readonly: storage owned by another system; images are registered
 * by reference (POST /api/v1/ingest/images) and never written, copied or deleted.
 */
export type StorageAccessMode = 'managed' | 'external_readonly';

export type CredentialType =
  | 'connection_string'
  | 'account_key'
  | 'access_key'
  | 'sas_token'
  | 'service_principal'
  | 'gcs_service_account'
  | 'external';

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
  session_token?: string;
}

/** Azure SAS — cannot mint short-lived URLs: images are served through Perceptra's signed proxy. */
export interface SasTokenCredentials {
  type: 'sas_token';
  sas_token: string;
}

/** Azure Entra ID service principal — short-lived user-delegation SAS URLs. */
export interface ServicePrincipalCredentials {
  type: 'service_principal';
  tenant_id: string;
  client_id: string;
  client_secret: string;
}

export interface GcsServiceAccountCredentials {
  type: 'gcs_service_account';
  service_account_info: Record<string, any> | string;
}

export type Credentials =
  | ConnectionStringCredentials
  | AccountKeyCredentials
  | AccessKeyCredentials
  | SasTokenCredentials
  | ServicePrincipalCredentials
  | GcsServiceAccountCredentials;


export interface StorageProfile {
  storage_profile_id?: string;
  name: string;
  backend: StorageBackend;
  region?: string;
  is_default?: boolean;
  access_mode?: StorageAccessMode;
  created_at?: string;
  updated_at?:string;
  /** Backend config as stored by the API (snake_case: container_name, bucket_name, ...). */
  config: Record<string, any>;
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
