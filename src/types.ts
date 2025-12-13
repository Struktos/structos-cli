/**
 * @struktos/cli - Type Definitions
 */

/**
 * Supported framework adapters
 */
export type FrameworkType = 'express' | 'fastify' | 'nestjs' | 'grpc';

/**
 * Supported persistence layers
 */
export type PersistenceType = 'postgresql' | 'mongodb' | 'none';

/**
 * Service type for generation
 */
export type ServiceType = 'http' | 'grpc';

/**
 * Project configuration from prompts
 */
export interface ProjectConfig {
  name: string;
  framework: FrameworkType;
  persistence: PersistenceType;
  useAuth: boolean;
  useDocker: boolean;
}

/**
 * Entity field definition
 */
export interface FieldDefinition {
  name: string;
  type: string;
  optional: boolean;
}

/**
 * Service definition for generation
 */
export interface ServiceDefinition {
  name: string;
  type: ServiceType;
  methods: ServiceMethod[];
}

/**
 * Service method definition
 */
export interface ServiceMethod {
  name: string;
  inputType: string;
  outputType: string;
  description?: string;
}

/**
 * gRPC service configuration
 */
export interface GrpcServiceConfig {
  name: string;
  packageName: string;
  methods: GrpcMethodConfig[];
}

/**
 * gRPC method configuration
 */
export interface GrpcMethodConfig {
  name: string;
  type: 'unary' | 'server-streaming' | 'client-streaming' | 'bidirectional';
  inputType: string;
  outputType: string;
}

/**
 * Generation result
 */
export interface GenerationResult {
  success: boolean;
  filesCreated: string[];
  errors?: string[];
}

/**
 * Framework adapter info
 */
export interface AdapterInfo {
  name: string;
  package: string;
  defaultPort: number;
  protocol: 'http' | 'grpc';
  description: string;
}

/**
 * Framework adapters configuration
 */
export const ADAPTERS: Record<FrameworkType, AdapterInfo> = {
  express: {
    name: 'Express',
    package: '@struktos/adapter-express',
    defaultPort: 3000,
    protocol: 'http',
    description: 'Express.js adapter for HTTP APIs',
  },
  fastify: {
    name: 'Fastify',
    package: '@struktos/adapter-fastify',
    defaultPort: 3000,
    protocol: 'http',
    description: 'Fastify adapter for high-performance HTTP APIs',
  },
  nestjs: {
    name: 'NestJS',
    package: '@struktos/adapter-nestjs',
    defaultPort: 3000,
    protocol: 'http',
    description: 'NestJS adapter for enterprise HTTP applications',
  },
  grpc: {
    name: 'gRPC',
    package: '@struktos/adapter-grpc',
    defaultPort: 50051,
    protocol: 'grpc',
    description: 'gRPC adapter for microservices',
  },
};