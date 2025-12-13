/**
 * Metadata Reader Utility
 * 
 * Reads and parses the struktos.metadata.json configuration file
 * to provide import paths and project structure information.
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * Core module import paths configuration
 */
export interface CoreImports {
  RequestContext: string;
  IInterceptor: string;
  ILogger: string;
  NextFn: string;
  IGrpcClientFactory: string;
  GrpcContextData: string;
}

/**
 * Project structure paths
 */
export interface ProjectPaths {
  domain: {
    entities: string;
    repositories: string;
    services: string;
  };
  application: {
    useCases: string;
    ports: {
      grpc: string;
      http: string;
    };
  };
  infrastructure: {
    adapters: {
      grpc: string;
      http: string;
      persistence: string;
    };
    middleware: string;
  };
  protos: string;
}

/**
 * Full metadata structure
 */
export interface StruktosMetadata {
  version: string;
  framework: 'express' | 'fastify' | 'nestjs' | 'grpc';
  coreImports: CoreImports;
  paths: ProjectPaths;
  options?: {
    useAuth?: boolean;
    persistence?: string;
  };
}

/**
 * Default metadata configuration
 */
const DEFAULT_METADATA: StruktosMetadata = {
  version: '1.0.0',
  framework: 'express',
  coreImports: {
    RequestContext: '@struktos/core',
    IInterceptor: '@struktos/core',
    ILogger: '@struktos/core',
    NextFn: '@struktos/core',
    IGrpcClientFactory: '@struktos/core',
    GrpcContextData: '@struktos/adapter-grpc',
  },
  paths: {
    domain: {
      entities: 'src/domain/entities',
      repositories: 'src/domain/repositories',
      services: 'src/domain/services',
    },
    application: {
      useCases: 'src/application/use-cases',
      ports: {
        grpc: 'src/application/ports/grpc',
        http: 'src/application/ports/http',
      },
    },
    infrastructure: {
      adapters: {
        grpc: 'src/infrastructure/adapters/grpc',
        http: 'src/infrastructure/adapters/http',
        persistence: 'src/infrastructure/adapters/persistence',
      },
      middleware: 'src/infrastructure/middleware',
    },
    protos: 'protos',
  },
};

/**
 * Read metadata from config file or return defaults
 */
export async function getMetadata(projectRoot?: string): Promise<StruktosMetadata> {
  const root = projectRoot || process.cwd();
  const metadataPath = path.join(root, 'config', 'struktos.metadata.json');

  try {
    if (await fs.pathExists(metadataPath)) {
      const content = await fs.readJson(metadataPath);
      return mergeMetadata(DEFAULT_METADATA, content);
    }
  } catch (error) {
    // Fall back to defaults if file is invalid
    console.warn('Warning: Could not read struktos.metadata.json, using defaults');
  }

  return DEFAULT_METADATA;
}

/**
 * Read metadata synchronously
 */
export function getMetadataSync(projectRoot?: string): StruktosMetadata {
  const root = projectRoot || process.cwd();
  const metadataPath = path.join(root, 'config', 'struktos.metadata.json');

  try {
    if (fs.pathExistsSync(metadataPath)) {
      const content = fs.readJsonSync(metadataPath);
      return mergeMetadata(DEFAULT_METADATA, content);
    }
  } catch (error) {
    // Fall back to defaults
  }

  return DEFAULT_METADATA;
}

/**
 * Deep merge metadata with defaults
 */
function mergeMetadata(
  defaults: StruktosMetadata,
  overrides: Partial<StruktosMetadata>
): StruktosMetadata {
  return {
    ...defaults,
    ...overrides,
    coreImports: {
      ...defaults.coreImports,
      ...overrides.coreImports,
    },
    paths: {
      domain: {
        ...defaults.paths.domain,
        ...overrides.paths?.domain,
      },
      application: {
        ...defaults.paths.application,
        ...overrides.paths?.application,
        ports: {
          ...defaults.paths.application.ports,
          ...overrides.paths?.application?.ports,
        },
      },
      infrastructure: {
        ...defaults.paths.infrastructure,
        ...overrides.paths?.infrastructure,
        adapters: {
          ...defaults.paths.infrastructure.adapters,
          ...overrides.paths?.infrastructure?.adapters,
        },
      },
      protos: overrides.paths?.protos || defaults.paths.protos,
    },
    options: {
      ...defaults.options,
      ...overrides.options,
    },
  };
}

/**
 * Get the default metadata (for new projects)
 */
export function getDefaultMetadata(): StruktosMetadata {
  return { ...DEFAULT_METADATA };
}

/**
 * Generate metadata file content
 */
export function generateMetadataContent(
  framework: string,
  options: { useAuth?: boolean; persistence?: string } = {}
): string {
  const metadata: StruktosMetadata = {
    ...DEFAULT_METADATA,
    framework: framework as StruktosMetadata['framework'],
    options,
  };

  if (framework === 'grpc') {
    metadata.coreImports.GrpcContextData = '@struktos/adapter-grpc';
  }

  return JSON.stringify(metadata, null, 2);
}