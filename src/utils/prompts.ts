/**
 * @struktos/cli - Prompt Utilities
 */

import inquirer from 'inquirer';
import { ProjectConfig, FrameworkType, PersistenceType, ServiceType } from '../types';

/**
 * Prompt for project configuration
 */
export async function promptProjectConfig(defaultName?: string): Promise<ProjectConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: defaultName || 'my-struktos-app',
      validate: (input: string) => {
        if (!input.trim()) return 'Project name is required';
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Project name must be lowercase letters, numbers, and hyphens only';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Select framework/adapter:',
      choices: [
        { name: '🚀 Express - Fast, minimalist web framework', value: 'express' },
        { name: '⚡ Fastify - High-performance web framework', value: 'fastify' },
        { name: '🏢 NestJS - Enterprise-grade framework', value: 'nestjs' },
        { name: '📡 gRPC - Microservices with Protocol Buffers', value: 'grpc' },
      ],
      default: 'express',
    },
    {
      type: 'list',
      name: 'persistence',
      message: 'Select persistence layer:',
      choices: [
        { name: '🐘 PostgreSQL - Relational database with Prisma', value: 'postgresql' },
        { name: '🍃 MongoDB - Document database with Mongoose', value: 'mongodb' },
        { name: '📦 None - In-memory storage only', value: 'none' },
      ],
      default: 'none',
    },
    {
      type: 'confirm',
      name: 'useAuth',
      message: 'Include authentication (@struktos/auth)?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'useDocker',
      message: 'Include Docker configuration?',
      default: true,
    },
  ]);

  return answers as ProjectConfig;
}

/**
 * Prompt for service type selection
 */
export async function promptServiceType(): Promise<ServiceType> {
  const { type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Select service type:',
      choices: [
        { name: '🌐 HTTP - REST API service', value: 'http' },
        { name: '📡 gRPC - Protocol Buffer service', value: 'grpc' },
      ],
      default: 'http',
    },
  ]);

  return type;
}

/**
 * Prompt for gRPC method types
 */
export async function promptGrpcMethods(serviceName: string): Promise<string[]> {
  const { methods } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'methods',
      message: `Select methods for ${serviceName} service:`,
      choices: [
        { name: 'Get - Retrieve single item (unary)', value: 'get', checked: true },
        { name: 'List - Retrieve multiple items (server streaming)', value: 'list', checked: true },
        { name: 'Create - Create new item (unary)', value: 'create', checked: true },
        { name: 'Update - Update existing item (unary)', value: 'update', checked: true },
        { name: 'Delete - Delete item (unary)', value: 'delete', checked: true },
      ],
    },
  ]);

  return methods;
}

/**
 * Confirm overwrite
 */
export async function confirmOverwrite(path: string): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `${path} already exists. Overwrite?`,
      default: false,
    },
  ]);

  return confirm;
}