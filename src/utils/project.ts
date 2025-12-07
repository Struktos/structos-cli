import fs from 'fs-extra';
import path from 'path';
import { ProjectOptions } from '../types';

/**
 * Create Hexagonal Architecture folder structure
 */
export async function createProjectStructure(options: ProjectOptions): Promise<void> {
  const { targetDirectory } = options;

  // Create base directories
  const directories = [
    // Root
    targetDirectory,
    
    // Source directories (Hexagonal Architecture)
    path.join(targetDirectory, 'src'),
    path.join(targetDirectory, 'src/domain'),
    path.join(targetDirectory, 'src/domain/entities'),
    path.join(targetDirectory, 'src/domain/repositories'),
    path.join(targetDirectory, 'src/domain/services'),
    
    path.join(targetDirectory, 'src/application'),
    path.join(targetDirectory, 'src/application/use-cases'),
    path.join(targetDirectory, 'src/application/ports'),
    
    path.join(targetDirectory, 'src/infrastructure'),
    path.join(targetDirectory, 'src/infrastructure/adapters'),
    path.join(targetDirectory, 'src/infrastructure/adapters/http'),
    path.join(targetDirectory, 'src/infrastructure/adapters/persistence'),
    
    path.join(targetDirectory, 'src/common'),
    path.join(targetDirectory, 'src/common/types'),
    path.join(targetDirectory, 'src/common/utils'),
    
    // Config directory
    path.join(targetDirectory, 'config'),
    
    // Test directory
    path.join(targetDirectory, 'tests'),
    path.join(targetDirectory, 'tests/unit'),
    path.join(targetDirectory, 'tests/integration')
  ];

  // Create all directories
  for (const dir of directories) {
    await fs.ensureDir(dir);
  }
}

/**
 * Check if directory exists and is empty
 */
export async function validateTargetDirectory(targetPath: string): Promise<{
  exists: boolean;
  isEmpty: boolean;
}> {
  const exists = await fs.pathExists(targetPath);
  
  if (!exists) {
    return { exists: false, isEmpty: true };
  }

  const files = await fs.readdir(targetPath);
  const isEmpty = files.length === 0;

  return { exists, isEmpty };
}

/**
 * Get dependency list based on project options
 */
export function getDependencies(options: ProjectOptions): {
  dependencies: string[];
  devDependencies: string[];
} {
  const dependencies: string[] = [
    '@struktos/core@^0.1.0'
  ];

  const devDependencies: string[] = [
    'typescript@^5.0.0',
    '@types/node@^20.0.0',
    'tsx@^4.0.0',
    'nodemon@^3.0.0'
  ];

  // Framework adapter
  if (options.framework === 'express') {
    dependencies.push('@struktos/adapter-express@^0.1.0');
    dependencies.push('express@^4.18.0');
    devDependencies.push('@types/express@^4.17.0');
  }

  // Authentication
  if (options.includeAuth) {
    dependencies.push('@struktos/auth@^0.1.0');
    dependencies.push('jsonwebtoken@^9.0.0');
    dependencies.push('bcryptjs@^2.4.3');
    devDependencies.push('@types/jsonwebtoken@^9.0.0');
    devDependencies.push('@types/bcryptjs@^2.4.0');
  }

  // Persistence layer
  if (options.persistence === 'postgresql') {
    dependencies.push('@prisma/client@^5.0.0');
    devDependencies.push('prisma@^5.0.0');
  } else if (options.persistence === 'mongodb') {
    dependencies.push('mongoose@^8.0.0');
    devDependencies.push('@types/mongoose@^8.0.0');
  }

  return { dependencies, devDependencies };
}