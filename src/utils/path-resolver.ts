/**
 * Path Resolver Utility
 * 
 * Calculates relative import paths between files in the project structure.
 * This ensures generated code has correct import statements.
 */

import path from 'path';

/**
 * Resolve a relative import path from currentFile to targetModule
 * 
 * @param targetModulePath - The path to the module being imported (e.g., 'src/domain/repositories/IUserRepository')
 * @param currentFilePath - The path of the file doing the import (e.g., 'src/application/use-cases/user/create-user.use-case.ts')
 * @returns Relative import path (e.g., '../../../domain/repositories/IUserRepository')
 * 
 * @example
 * resolveImportPath('src/domain/repositories/IUserRepository', 'src/application/use-cases/user/create-user.use-case.ts')
 * // Returns: '../../../domain/repositories/IUserRepository'
 */
export function resolveImportPath(targetModulePath: string, currentFilePath: string): string {
  // If target is a package import (starts with @ or doesn't start with ./ or ../)
  if (isPackageImport(targetModulePath)) {
    return targetModulePath;
  }

  // Normalize paths (remove .ts extension, normalize separators)
  const normalizedTarget = normalizePath(targetModulePath);
  const normalizedCurrent = normalizePath(currentFilePath);

  // Get directory of current file
  const currentDir = path.dirname(normalizedCurrent);

  // Calculate relative path
  let relativePath = path.relative(currentDir, normalizedTarget);

  // Ensure it starts with ./ or ../
  if (!relativePath.startsWith('.') && !relativePath.startsWith('..')) {
    relativePath = './' + relativePath;
  }

  // Convert Windows backslashes to forward slashes
  relativePath = relativePath.replace(/\\/g, '/');

  return relativePath;
}

/**
 * Check if the path is a package import (npm package)
 */
export function isPackageImport(importPath: string): boolean {
  // Package imports start with @ (scoped) or don't start with . or /
  if (importPath.startsWith('@')) return true;
  if (importPath.startsWith('.') || importPath.startsWith('/')) return false;
  
  // Check if it looks like a relative path
  if (importPath.includes('/src/') || importPath.startsWith('src/')) return false;
  
  return true;
}

/**
 * Normalize a file path for comparison
 */
function normalizePath(filePath: string): string {
  // Remove .ts extension
  let normalized = filePath.replace(/\.ts$/, '');
  
  // Normalize path separators
  normalized = normalized.replace(/\\/g, '/');
  
  // Remove leading ./
  if (normalized.startsWith('./')) {
    normalized = normalized.substring(2);
  }
  
  return normalized;
}

/**
 * Calculate the depth of a path (number of directory levels)
 */
export function getPathDepth(filePath: string): number {
  const normalized = normalizePath(filePath);
  return normalized.split('/').filter(Boolean).length;
}

/**
 * Get the relative path prefix (../) based on depth
 */
export function getRelativePrefix(fromPath: string, toPath: string): string {
  const fromDir = path.dirname(normalizePath(fromPath));
  const toDir = path.dirname(normalizePath(toPath));
  
  const fromParts = fromDir.split('/').filter(Boolean);
  const toParts = toDir.split('/').filter(Boolean);
  
  // Find common prefix
  let commonLength = 0;
  while (
    commonLength < fromParts.length &&
    commonLength < toParts.length &&
    fromParts[commonLength] === toParts[commonLength]
  ) {
    commonLength++;
  }
  
  // Calculate how many levels up we need to go
  const levelsUp = fromParts.length - commonLength;
  
  if (levelsUp === 0) {
    return './';
  }
  
  return '../'.repeat(levelsUp);
}

/**
 * Resolve import path for repository interface
 * 
 * @param entityName - The entity name (e.g., 'User')
 * @param currentFilePath - The current file path
 * @param repositoriesPath - The path to repositories directory (e.g., 'src/domain/repositories')
 */
export function resolveRepositoryImport(
  entityName: string,
  currentFilePath: string,
  repositoriesPath: string = 'src/domain/repositories'
): string {
  const targetPath = `${repositoriesPath}/I${entityName}Repository`;
  return resolveImportPath(targetPath, currentFilePath);
}

/**
 * Resolve import path for entity
 */
export function resolveEntityImport(
  entityName: string,
  currentFilePath: string,
  entitiesPath: string = 'src/domain/entities'
): string {
  const targetPath = `${entitiesPath}/${entityName}.entity`;
  return resolveImportPath(targetPath, currentFilePath);
}

/**
 * Resolve import path for use case
 */
export function resolveUseCaseImport(
  useCaseName: string,
  entityName: string,
  currentFilePath: string,
  useCasesPath: string = 'src/application/use-cases'
): string {
  const kebabEntity = toKebabCase(entityName);
  const kebabUseCase = toKebabCase(useCaseName);
  const targetPath = `${useCasesPath}/${kebabEntity}/${kebabUseCase}-${kebabEntity}.use-case`;
  return resolveImportPath(targetPath, currentFilePath);
}

/**
 * Convert string to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Build an import statement
 */
export function buildImportStatement(
  imports: string | string[],
  fromPath: string
): string {
  const importList = Array.isArray(imports) ? imports.join(', ') : imports;
  return `import { ${importList} } from '${fromPath}';`;
}

/**
 * Build multiple import statements from a map
 */
export function buildImportStatements(
  importMap: Record<string, string[]>
): string[] {
  return Object.entries(importMap).map(([fromPath, imports]) =>
    buildImportStatement(imports, fromPath)
  );
}