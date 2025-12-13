/**
 * Package Generator Unit Tests
 */

import {
  generatePackageJson,
  generateTsConfig,
} from '../../src/generators/packageGenerator';
import { ProjectConfig } from '../../src/types';

describe('packageGenerator', () => {
  describe('generatePackageJson', () => {
    const baseConfig: ProjectConfig = {
      name: 'test-app',
      framework: 'express',
      persistence: 'none',
      useAuth: false,
      useDocker: false,
    };

    it('should generate valid JSON', () => {
      const result = generatePackageJson(baseConfig);
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should include project name', () => {
      const result = JSON.parse(generatePackageJson(baseConfig));
      expect(result.name).toBe('test-app');
    });

    it('should include @struktos/core dependency', () => {
      const result = JSON.parse(generatePackageJson(baseConfig));
      expect(result.dependencies['@struktos/core']).toBeDefined();
    });

    it('should include correct adapter for Express', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'express' };
      const result = JSON.parse(generatePackageJson(config));
      
      expect(result.dependencies['@struktos/adapter-express']).toBeDefined();
      expect(result.dependencies['express']).toBeDefined();
    });

    it('should include correct adapter for Fastify', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'fastify' };
      const result = JSON.parse(generatePackageJson(config));
      
      expect(result.dependencies['@struktos/adapter-fastify']).toBeDefined();
      expect(result.dependencies['fastify']).toBeDefined();
    });

    it('should include correct adapter for gRPC', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'grpc' };
      const result = JSON.parse(generatePackageJson(config));
      
      expect(result.dependencies['@struktos/adapter-grpc']).toBeDefined();
      expect(result.dependencies['@grpc/grpc-js']).toBeDefined();
      expect(result.dependencies['@grpc/proto-loader']).toBeDefined();
    });

    it('should include auth dependencies when useAuth is true', () => {
      const config: ProjectConfig = { ...baseConfig, useAuth: true };
      const result = JSON.parse(generatePackageJson(config));
      
      expect(result.dependencies['@struktos/auth']).toBeDefined();
      expect(result.dependencies['jsonwebtoken']).toBeDefined();
      expect(result.dependencies['bcryptjs']).toBeDefined();
      expect(result.devDependencies['@types/jsonwebtoken']).toBeDefined();
    });

    it('should include PostgreSQL dependencies', () => {
      const config: ProjectConfig = { ...baseConfig, persistence: 'postgresql' };
      const result = JSON.parse(generatePackageJson(config));
      
      expect(result.dependencies['@prisma/client']).toBeDefined();
      expect(result.devDependencies['prisma']).toBeDefined();
      expect(result.scripts['db:generate']).toBeDefined();
      expect(result.scripts['db:push']).toBeDefined();
    });

    it('should include MongoDB dependencies', () => {
      const config: ProjectConfig = { ...baseConfig, persistence: 'mongodb' };
      const result = JSON.parse(generatePackageJson(config));
      
      expect(result.dependencies['mongoose']).toBeDefined();
    });

    it('should include standard scripts', () => {
      const result = JSON.parse(generatePackageJson(baseConfig));
      
      expect(result.scripts.build).toBeDefined();
      expect(result.scripts.start).toBeDefined();
      expect(result.scripts.dev).toBeDefined();
    });

    it('should include grpc keyword for gRPC projects', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'grpc' };
      const result = JSON.parse(generatePackageJson(config));
      
      expect(result.keywords).toContain('grpc');
      expect(result.keywords).toContain('microservices');
    });
  });

  describe('generateTsConfig', () => {
    it('should generate valid JSON', () => {
      const result = generateTsConfig();
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should include required compiler options', () => {
      const result = JSON.parse(generateTsConfig());
      
      expect(result.compilerOptions.target).toBe('ES2022');
      expect(result.compilerOptions.module).toBe('commonjs');
      expect(result.compilerOptions.strict).toBe(true);
      expect(result.compilerOptions.outDir).toBe('./dist');
      expect(result.compilerOptions.rootDir).toBe('./src');
    });

    it('should include decorator support', () => {
      const result = JSON.parse(generateTsConfig());
      
      expect(result.compilerOptions.experimentalDecorators).toBe(true);
      expect(result.compilerOptions.emitDecoratorMetadata).toBe(true);
    });

    it('should exclude node_modules and dist', () => {
      const result = JSON.parse(generateTsConfig());
      
      expect(result.exclude).toContain('node_modules');
      expect(result.exclude).toContain('dist');
    });
  });
});