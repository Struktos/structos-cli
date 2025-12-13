/**
 * @struktos/cli - Field Parser Utilities
 */

import { FieldDefinition } from '../types';

/**
 * Parse field definitions from string
 * Format: "name:type,name:type?" (? for optional)
 */
export function parseFields(input: string): FieldDefinition[] {
  if (!input.trim()) return [];

  return input.split(',').map((field) => {
    const trimmed = field.trim();
    const [name, typeWithOptional] = trimmed.split(':');

    if (!name || !typeWithOptional) {
      throw new Error(`Invalid field format: "${trimmed}". Use "name:type"`);
    }

    const optional = typeWithOptional.endsWith('?');
    const type = optional ? typeWithOptional.slice(0, -1) : typeWithOptional;

    validateType(type);

    return {
      name: name.trim(),
      type: type.trim(),
      optional,
    };
  });
}

/**
 * Validate field type
 */
export function validateType(type: string): void {
  const validTypes = ['string', 'number', 'boolean', 'Date', 'any', 'unknown'];
  if (!validTypes.includes(type)) {
    throw new Error(
      `Invalid type: "${type}". Valid types: ${validTypes.join(', ')}`
    );
  }
}

/**
 * Validate entity name
 */
export function validateEntityName(name: string): void {
  if (!name) {
    throw new Error('Entity name is required');
  }
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
    throw new Error(
      'Entity name must start with a letter and contain only alphanumeric characters'
    );
  }
}

/**
 * Validate service name (allows kebab-case for microservices)
 * Examples: user-service, inventory-service, UserService
 */
export function validateServiceName(name: string): void {
  if (!name) {
    throw new Error('Service name is required');
  }
  // Allow: PascalCase, camelCase, kebab-case, snake_case
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(name)) {
    throw new Error(
      'Service name must start with a letter and contain only alphanumeric characters, hyphens, or underscores'
    );
  }
}

/**
 * Convert to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Convert to camelCase
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Pluralize a word (simple version)
 */
export function pluralize(word: string): string {
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
}