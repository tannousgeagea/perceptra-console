export type StorageBackend = 'azure' | 's3' | 'minio' | 'local';

export interface StorageProfile {
  id: string;
  name: string;
  backend: StorageBackend;
  region?: string;
  isDefault: boolean;
  createdAt: string;
  config: AzureConfig | S3Config | MinioConfig | LocalConfig;
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
