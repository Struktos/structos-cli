/**
 * Framework Adapter options
 */
export type FrameworkAdapter = 'express' | 'fastify' | 'koa';

/**
 * Persistence Layer options
 */
export type PersistenceLayer = 'postgresql' | 'mongodb' | 'none';

/**
 * Project configuration options
 */
export interface ProjectOptions {
  /**
   * Project name
   */
  name: string;
  
  /**
   * Framework adapter to use
   */
  framework: FrameworkAdapter;
  
  /**
   * Persistence layer to use
   */
  persistence: PersistenceLayer;
  
  /**
   * Include authentication module
   */
  includeAuth: boolean;
  
  /**
   * Target directory for project creation
   */
  targetDirectory: string;
}

/**
 * Template data for file generation
 */
export interface TemplateData {
  projectName: string;
  framework: FrameworkAdapter;
  persistence: PersistenceLayer;
  includeAuth: boolean;
  dependencies: string[];
  devDependencies: string[];
}