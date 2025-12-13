/**
 * Middleware (Interceptor) Generator
 * 
 * Uses Handlebars templates for generating interceptor files.
 */

import path from 'path';
import { TemplateRenderer } from './template-renderer';
import { toPascalCase, toCamelCase, toKebabCase } from '../utils/fieldParser';
import { getMetadataSync } from '../utils/metadata-reader';

/**
 * Template data for middleware generation
 */
export interface MiddlewareTemplateData {
  name: string;
  nameLower: string;
  withLogger?: boolean;
  currentFilePath: string;
  coreImports: {
    IInterceptor: string;
    RequestContext: string;
    ILogger: string;
  };
}

/**
 * Generate a middleware/interceptor file using Handlebars template
 */
export function generateMiddleware(name: string, options?: { withLogger?: boolean }): string {
  const renderer = new TemplateRenderer();
  const metadata = getMetadataSync();
  
  const className = toPascalCase(name);
  const currentFilePath = path.join(
    metadata.paths.infrastructure.middleware,
    `${toKebabCase(name)}.interceptor.ts`
  );

  const data: MiddlewareTemplateData = {
    name: className,
    nameLower: toCamelCase(name),
    withLogger: options?.withLogger,
    currentFilePath,
    coreImports: metadata.coreImports,
  };

  return renderer.render('middleware/default', data);
}

/**
 * Generate logging interceptor using Handlebars template
 */
export function generateLoggingMiddleware(): string {
  const renderer = new TemplateRenderer();
  const metadata = getMetadataSync();
  
  const currentFilePath = path.join(
    metadata.paths.infrastructure.middleware,
    'logging.interceptor.ts'
  );

  return renderer.render('middleware/logging', {
    currentFilePath,
    coreImports: metadata.coreImports,
  });
}

/**
 * Generate timing interceptor using Handlebars template
 */
export function generateTimingMiddleware(): string {
  const renderer = new TemplateRenderer();
  const metadata = getMetadataSync();
  
  const currentFilePath = path.join(
    metadata.paths.infrastructure.middleware,
    'timing.interceptor.ts'
  );

  return renderer.render('middleware/timing', {
    currentFilePath,
    coreImports: metadata.coreImports,
  });
}