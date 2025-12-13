/**
 * @struktos/cli - Project Utilities
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * Hexagonal Architecture directory structure
 */
export const PROJECT_STRUCTURE = {
  src: {
    domain: {
      entities: null,
      repositories: null,
      services: null,
    },
    application: {
      'use-cases': null,
      ports: null,
    },
    infrastructure: {
      adapters: {
        http: null,
        grpc: null,
        persistence: null,
      },
    },
    common: {
      types: null,
      utils: null,
    },
  },
  tests: {
    unit: null,
    integration: null,
  },
  config: null,
  protos: null,
};

/**
 * Create project directory structure
 */
export async function createProjectStructure(
  projectPath: string,
  includeGrpc: boolean = false
): Promise<void> {
  const createDirs = async (basePath: string, structure: any): Promise<void> => {
    for (const [name, children] of Object.entries(structure)) {
      // Skip grpc directory if not needed
      if (name === 'grpc' && !includeGrpc) continue;
      if (name === 'protos' && !includeGrpc) continue;

      const dirPath = path.join(basePath, name);
      await fs.ensureDir(dirPath);
      
      // Add .gitkeep for empty directories
      if (children === null) {
        await fs.writeFile(path.join(dirPath, '.gitkeep'), '');
      } else {
        await createDirs(dirPath, children);
      }
    }
  };

  await createDirs(projectPath, PROJECT_STRUCTURE);
}

/**
 * Check if current directory is a Struktos project
 */
export async function isStruktosProject(dir: string = process.cwd()): Promise<boolean> {
  const requiredDirs = [
    'src/domain/entities',
    'src/domain/repositories',
    'src/application/use-cases',
    'src/infrastructure/adapters',
  ];

  for (const requiredDir of requiredDirs) {
    const exists = await fs.pathExists(path.join(dir, requiredDir));
    if (!exists) return false;
  }

  // Check for package.json with struktos dependency
  const packageJsonPath = path.join(dir, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    return Object.keys(deps).some((dep) => dep.startsWith('@struktos/'));
  }

  return false;
}

/**
 * Get project root directory
 */
export async function getProjectRoot(): Promise<string | null> {
  let currentDir = process.cwd();
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    if (await isStruktosProject(currentDir)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * Ensure directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Write file with directory creation
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}