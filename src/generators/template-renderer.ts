/**
 * Template Renderer
 * 
 * Renders Handlebars templates with project-specific data.
 * Provides custom helpers for import path resolution and naming conventions.
 */

import Handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import { resolveImportPath, isPackageImport } from '../utils/path-resolver';
import { getMetadataSync, StruktosMetadata } from '../utils/metadata-reader';

// Cache for compiled templates
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

// Register custom Handlebars helpers
registerHelpers();

/**
 * Register all custom Handlebars helpers
 */
function registerHelpers(): void {
  /**
   * importPath helper - resolves relative import paths
   * Usage: {{importPath targetPath currentPath}}
   * 
   * @example
   * {{importPath "src/domain/repositories/IUserRepository" "src/application/use-cases/user/create-user.use-case.ts"}}
   * // Returns: ../../../domain/repositories/IUserRepository
   */
  Handlebars.registerHelper('importPath', (target: string, current: string): string => {
    if (isPackageImport(target)) {
      return target;
    }
    return resolveImportPath(target, current);
  });

  /**
   * camelCase helper
   * Usage: {{camelCase "UserProfile"}} -> userProfile
   */
  Handlebars.registerHelper('camelCase', (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toLowerCase() + str.slice(1);
  });

  /**
   * pascalCase helper
   * Usage: {{pascalCase "user-profile"}} -> UserProfile
   */
  Handlebars.registerHelper('pascalCase', (str: string): string => {
    if (!str) return '';
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^./, (c) => c.toUpperCase());
  });

  /**
   * kebabCase helper
   * Usage: {{kebabCase "UserProfile"}} -> user-profile
   */
  Handlebars.registerHelper('kebabCase', (str: string): string => {
    if (!str) return '';
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  });

  /**
   * snakeCase helper
   * Usage: {{snakeCase "UserProfile"}} -> user_profile
   */
  Handlebars.registerHelper('snakeCase', (str: string): string => {
    if (!str) return '';
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  });

  /**
   * upperSnakeCase helper (for constants)
   * Usage: {{upperSnakeCase "UserProfile"}} -> USER_PROFILE
   */
  Handlebars.registerHelper('upperSnakeCase', (str: string): string => {
    if (!str) return '';
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toUpperCase();
  });

  /**
   * pluralize helper (simple)
   * Usage: {{pluralize "User"}} -> Users
   */
  Handlebars.registerHelper('pluralize', (str: string): string => {
    if (!str) return '';
    if (str.endsWith('y')) {
      return str.slice(0, -1) + 'ies';
    }
    if (str.endsWith('s') || str.endsWith('x') || str.endsWith('ch') || str.endsWith('sh')) {
      return str + 'es';
    }
    return str + 's';
  });

  /**
   * eq helper for equality comparison
   * Usage: {{#if (eq action "create")}}...{{/if}}
   */
  Handlebars.registerHelper('eq', (a: unknown, b: unknown): boolean => {
    return a === b;
  });

  /**
   * ne helper for inequality
   * Usage: {{#if (ne action "delete")}}...{{/if}}
   */
  Handlebars.registerHelper('ne', (a: unknown, b: unknown): boolean => {
    return a !== b;
  });

  /**
   * or helper
   * Usage: {{#if (or condA condB)}}...{{/if}}
   */
  Handlebars.registerHelper('or', (...args: unknown[]): boolean => {
    // Remove the options object (last argument)
    const conditions = args.slice(0, -1);
    return conditions.some(Boolean);
  });

  /**
   * and helper
   * Usage: {{#if (and condA condB)}}...{{/if}}
   */
  Handlebars.registerHelper('and', (...args: unknown[]): boolean => {
    const conditions = args.slice(0, -1);
    return conditions.every(Boolean);
  });

  /**
   * timestamp helper
   * Usage: {{timestamp}} -> 2025-12-11
   */
  Handlebars.registerHelper('timestamp', (): string => {
    return new Date().toISOString().split('T')[0];
  });

  /**
   * json helper - stringify object for debugging
   * Usage: {{json someObject}}
   */
  Handlebars.registerHelper('json', (obj: unknown): string => {
    return JSON.stringify(obj, null, 2);
  });

  /**
   * concat helper
   * Usage: {{concat "Hello" " " "World"}} -> Hello World
   */
  Handlebars.registerHelper('concat', (...args: unknown[]): string => {
    const strings = args.slice(0, -1) as string[];
    return strings.join('');
  });

  /**
   * includes helper for array
   * Usage: {{#if (includes methods "create")}}...{{/if}}
   */
  Handlebars.registerHelper('includes', (arr: unknown[], item: unknown): boolean => {
    if (!Array.isArray(arr)) return false;
    return arr.includes(item);
  });
}

/**
 * Template Renderer Class
 */
export class TemplateRenderer {
  private readonly templatesDir: string;
  private readonly metadata: StruktosMetadata;

  constructor(options?: { templatesDir?: string; projectRoot?: string }) {
    // Default to the bundled templates directory
    this.templatesDir = options?.templatesDir || path.join(__dirname, '..', 'templates');
    this.metadata = getMetadataSync(options?.projectRoot);
  }

  /**
   * Render a template with the given data
   * 
   * @param templateName - Template path relative to templates dir (e.g., 'middleware/default')
   * @param data - Data object to pass to the template
   * @returns Rendered string
   */
  render<T extends object>(templateName: string, data: T): string {
    const template = this.getTemplate(templateName);
    
    // Merge metadata into data
    const mergedData = {
      ...data,
      metadata: this.metadata,
      coreImports: this.metadata.coreImports,
      paths: this.metadata.paths,
    };

    return template(mergedData);
  }

  /**
   * Get a compiled template (with caching)
   */
  private getTemplate(templateName: string): HandlebarsTemplateDelegate {
    const cacheKey = `${this.templatesDir}:${templateName}`;
    
    if (templateCache.has(cacheKey)) {
      return templateCache.get(cacheKey)!;
    }

    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const compiled = Handlebars.compile(templateSource, {
      strict: false,
      noEscape: true, // Don't escape HTML entities in generated code
    });

    templateCache.set(cacheKey, compiled);
    return compiled;
  }

  /**
   * Register a partial template
   */
  registerPartial(name: string, templateName: string): void {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf-8');
    Handlebars.registerPartial(name, source);
  }

  /**
   * Check if a template exists
   */
  templateExists(templateName: string): boolean {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    return fs.existsSync(templatePath);
  }

  /**
   * Get the metadata
   */
  getMetadata(): StruktosMetadata {
    return this.metadata;
  }

  /**
   * Clear the template cache
   */
  static clearCache(): void {
    templateCache.clear();
  }
}

/**
 * Create a template renderer instance
 */
export function createTemplateRenderer(options?: {
  templatesDir?: string;
  projectRoot?: string;
}): TemplateRenderer {
  return new TemplateRenderer(options);
}

/**
 * Quick render function for simple cases
 */
export function renderTemplate<T extends object>(
  templateName: string,
  data: T,
  options?: { templatesDir?: string; projectRoot?: string }
): string {
  const renderer = new TemplateRenderer(options);
  return renderer.render(templateName, data);
}