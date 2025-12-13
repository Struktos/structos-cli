/**
 * Config Generator Unit Tests
 */

import {
  generateEnvExample,
  generateGitignore,
  generateDockerfile,
  generateDockerCompose,
  generateReadme,
} from '../../src/generators/configGenerator';
import { ProjectConfig } from '../../src/types';

describe('configGenerator', () => {
  const baseConfig: ProjectConfig = {
    name: 'test-app',
    framework: 'express',
    persistence: 'none',
    useAuth: false,
    useDocker: false,
  };

  describe('generateEnvExample', () => {
    it('should include NODE_ENV', () => {
      const result = generateEnvExample(baseConfig);
      expect(result).toContain('NODE_ENV=development');
    });

    it('should include PORT for HTTP frameworks', () => {
      const result = generateEnvExample(baseConfig);
      expect(result).toContain('PORT=3000');
    });

    it('should include GRPC_PORT for gRPC framework', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'grpc' };
      const result = generateEnvExample(config);

      expect(result).toContain('GRPC_PORT=50051');
      expect(result).toContain('GRPC_HOST=0.0.0.0');
    });

    it('should include JWT config when useAuth is true', () => {
      const config: ProjectConfig = { ...baseConfig, useAuth: true };
      const result = generateEnvExample(config);

      expect(result).toContain('JWT_SECRET');
      expect(result).toContain('JWT_EXPIRES_IN');
    });

    it('should include PostgreSQL config', () => {
      const config: ProjectConfig = { ...baseConfig, persistence: 'postgresql' };
      const result = generateEnvExample(config);

      expect(result).toContain('DATABASE_URL=postgresql://');
    });

    it('should include MongoDB config', () => {
      const config: ProjectConfig = { ...baseConfig, persistence: 'mongodb' };
      const result = generateEnvExample(config);

      expect(result).toContain('MONGODB_URI=mongodb://');
    });
  });

  describe('generateGitignore', () => {
    it('should include node_modules', () => {
      const result = generateGitignore();
      expect(result).toContain('node_modules/');
    });

    it('should include dist', () => {
      const result = generateGitignore();
      expect(result).toContain('dist/');
    });

    it('should include .env files', () => {
      const result = generateGitignore();
      expect(result).toContain('.env');
      expect(result).toContain('.env.local');
    });

    it('should include IDE directories', () => {
      const result = generateGitignore();
      expect(result).toContain('.idea/');
      expect(result).toContain('.vscode/');
    });

    it('should include coverage', () => {
      const result = generateGitignore();
      expect(result).toContain('coverage/');
    });
  });

  describe('generateDockerfile', () => {
    it('should use Node.js 20 alpine', () => {
      const result = generateDockerfile(baseConfig);
      expect(result).toContain('FROM node:20-alpine');
    });

    it('should have multi-stage build', () => {
      const result = generateDockerfile(baseConfig);
      expect(result).toContain('AS builder');
      expect(result).toContain('AS production');
    });

    it('should expose correct port for HTTP', () => {
      const result = generateDockerfile(baseConfig);
      expect(result).toContain('EXPOSE 3000');
    });

    it('should expose correct port for gRPC', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'grpc' };
      const result = generateDockerfile(config);

      expect(result).toContain('EXPOSE 50051');
      expect(result).toContain('GRPC_PORT=50051');
    });

    it('should copy protos directory for gRPC', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'grpc' };
      const result = generateDockerfile(config);

      expect(result).toContain('COPY --from=builder /app/protos ./protos');
    });

    it('should not copy protos for HTTP', () => {
      const result = generateDockerfile(baseConfig);
      expect(result).not.toContain('/protos');
    });
  });

  describe('generateDockerCompose', () => {
    it('should include app service', () => {
      const result = generateDockerCompose(baseConfig);
      expect(result).toContain('services:');
      expect(result).toContain('app:');
    });

    it('should map correct port', () => {
      const result = generateDockerCompose(baseConfig);
      expect(result).toContain('"3000:3000"');
    });

    it('should map gRPC port', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'grpc' };
      const result = generateDockerCompose(config);

      expect(result).toContain('"50051:50051"');
    });

    it('should include PostgreSQL service', () => {
      const config: ProjectConfig = { ...baseConfig, persistence: 'postgresql' };
      const result = generateDockerCompose(config);

      expect(result).toContain('postgres:16-alpine');
      expect(result).toContain('POSTGRES_USER');
      expect(result).toContain('postgres_data');
    });

    it('should include MongoDB service', () => {
      const config: ProjectConfig = { ...baseConfig, persistence: 'mongodb' };
      const result = generateDockerCompose(config);

      expect(result).toContain('mongo:7');
      expect(result).toContain('mongo_data');
    });
  });

  describe('generateReadme', () => {
    it('should include project name', () => {
      const result = generateReadme(baseConfig);
      expect(result).toContain('# test-app');
    });

    it('should include quick start instructions', () => {
      const result = generateReadme(baseConfig);
      expect(result).toContain('npm install');
      expect(result).toContain('npm run dev');
    });

    it('should include project structure', () => {
      const result = generateReadme(baseConfig);
      expect(result).toContain('src/');
      expect(result).toContain('domain/');
      expect(result).toContain('application/');
      expect(result).toContain('infrastructure/');
    });

    it('should include gRPC-specific content for gRPC', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'grpc' };
      const result = generateReadme(config);

      expect(result).toContain('grpc://localhost:50051');
      expect(result).toContain('grpcurl');
      expect(result).toContain('protos/');
      expect(result).toContain('struktos generate service');
    });

    it('should include HTTP-specific content for Express', () => {
      const result = generateReadme(baseConfig);

      expect(result).toContain('http://localhost:3000');
      expect(result).toContain('struktos generate entity');
    });

    it('should include Docker instructions when useDocker is true', () => {
      const config: ProjectConfig = { ...baseConfig, useDocker: true };
      const result = generateReadme(config);

      expect(result).toContain('docker-compose');
    });

    it('should include database scripts for PostgreSQL', () => {
      const config: ProjectConfig = { ...baseConfig, persistence: 'postgresql' };
      const result = generateReadme(config);

      expect(result).toContain('db:generate');
      expect(result).toContain('db:push');
    });
  });
});