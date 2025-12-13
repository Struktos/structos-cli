/**
 * Use Case Generator
 * 
 * Uses Handlebars templates for generating use case files.
 */

import path from 'path';
import { TemplateRenderer } from './template-renderer';
import { toPascalCase, toCamelCase, toKebabCase } from '../utils/fieldParser';
import { getMetadataSync } from '../utils/metadata-reader';
import { resolveImportPath } from '../utils/path-resolver';

/**
 * Use case action types
 */
export type UseCaseAction = 
  | 'create' 
  | 'get' 
  | 'list' 
  | 'update' 
  | 'delete' 
  | 'find'
  | 'search'
  | 'validate'
  | 'process'
  | 'execute';

/**
 * Template data for use case generation
 */
export interface UseCaseTemplateData {
  action: string;
  actionLower: string;
  entity: string;
  entityLower: string;
  needsRepository: boolean;
  needsLogger: boolean;
  needsValidation: boolean;
  currentFilePath: string;
  repositoryImportPath: string;
  entityImportPath: string;
  coreImports: {
    RequestContext: string;
    ILogger: string;
  };
}

/**
 * Generate a use case file using Handlebars template
 */
export function generateUseCase(
  action: string,
  entityName: string,
  options: {
    withRepository?: boolean;
    withLogger?: boolean;
    withValidation?: boolean;
  } = {}
): string {
  const renderer = new TemplateRenderer();
  const metadata = getMetadataSync();
  
  const actionPascal = toPascalCase(action);
  const entityPascal = toPascalCase(entityName);
  const actionLower = action.toLowerCase();
  const entityLower = toCamelCase(entityName);
  const kebabEntity = toKebabCase(entityName);
  const kebabAction = toKebabCase(action);

  // Calculate file paths
  const currentFilePath = path.join(
    metadata.paths.application.useCases,
    kebabEntity,
    `${kebabAction}-${kebabEntity}.use-case.ts`
  );

  const repositoryPath = path.join(
    metadata.paths.domain.repositories,
    `I${entityPascal}Repository`
  );

  const entityPath = path.join(
    metadata.paths.domain.entities,
    `${entityPascal}.entity`
  );

  // Calculate relative import paths
  const repositoryImportPath = resolveImportPath(repositoryPath, currentFilePath);
  const entityImportPath = resolveImportPath(entityPath, currentFilePath);

  const {
    withRepository = true,
    withLogger = true,
    withValidation = true,
  } = options;

  const data: UseCaseTemplateData = {
    action: actionPascal,
    actionLower,
    entity: entityPascal,
    entityLower,
    needsRepository: withRepository,
    needsLogger: withLogger,
    needsValidation: withValidation,
    currentFilePath,
    repositoryImportPath,
    entityImportPath,
    coreImports: metadata.coreImports,
  };

  return renderer.render('use-case/default', data);
}