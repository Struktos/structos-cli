/**
 * gRPC Client Adapter Generator
 * 
 * Uses Handlebars templates for generating gRPC client adapters.
 */

import path from 'path';
import { TemplateRenderer } from './template-renderer';
import { toPascalCase, toCamelCase, toKebabCase, toSnakeCase } from '../utils/fieldParser';
import { getMetadataSync } from '../utils/metadata-reader';
import { resolveImportPath } from '../utils/path-resolver';

/**
 * Template data for client adapter generation
 */
export interface ClientAdapterTemplateData {
  service: string;
  serviceLower: string;
  serviceKebab: string;
  serviceSnake: string;
  currentFilePath: string;
  portImportPath?: string;
  coreImports: {
    RequestContext: string;
    IGrpcClientFactory?: string;
  };
}

/**
 * Template data for client port generation
 */
export interface ClientPortTemplateData {
  service: string;
  serviceLower: string;
  currentFilePath: string;
  coreImports: {
    RequestContext: string;
  };
}

/**
 * Generate a gRPC client adapter using Handlebars template
 */
export function generateGrpcClientAdapter(
  serviceName: string,
  options?: { portPath?: string }
): string {
  const renderer = new TemplateRenderer();
  const metadata = getMetadataSync();
  
  const servicePascal = toPascalCase(serviceName);
  const serviceLower = toCamelCase(serviceName);
  const serviceKebab = toKebabCase(serviceName);
  const serviceSnake = toSnakeCase(serviceName);

  // Calculate file paths
  const currentFilePath = path.join(
    metadata.paths.infrastructure.adapters.grpc,
    `${serviceKebab}.client.adapter.ts`
  );

  // Calculate port import path if provided
  let portImportPath: string | undefined;
  if (options?.portPath) {
    portImportPath = resolveImportPath(options.portPath, currentFilePath);
  }

  const data: ClientAdapterTemplateData = {
    service: servicePascal,
    serviceLower,
    serviceKebab,
    serviceSnake,
    currentFilePath,
    portImportPath,
    coreImports: metadata.coreImports,
  };

  return renderer.render('client/adapter', data);
}

/**
 * Generate a client port interface using Handlebars template
 */
export function generateClientPortInterface(serviceName: string): string {
  const renderer = new TemplateRenderer();
  const metadata = getMetadataSync();
  
  const servicePascal = toPascalCase(serviceName);
  const serviceLower = toCamelCase(serviceName);
  const serviceKebab = toKebabCase(serviceName);

  const currentFilePath = path.join(
    metadata.paths.application.ports.grpc,
    `${serviceKebab}.client.port.ts`
  );

  const data: ClientPortTemplateData = {
    service: servicePascal,
    serviceLower,
    currentFilePath,
    coreImports: metadata.coreImports,
  };

  return renderer.render('client/port', data);
}