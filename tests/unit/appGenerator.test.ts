/**
 * App Generator Unit Tests
 */

import {
  generateMainTs,
  generateHttpMain,
  generateGrpcMain,
} from '../../src/generators/appGenerator';
import { ProjectConfig } from '../../src/types';

describe('appGenerator', () => {
  const baseConfig: ProjectConfig = {
    name: 'test-app',
    framework: 'express',
    persistence: 'none',
    useAuth: false,
    useDocker: false,
  };

  describe('generateMainTs', () => {
    it('should generate HTTP main for Express', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'express' };
      const result = generateMainTs(config);

      expect(result).toContain('ExpressStruktosAdapter');
      expect(result).toContain('express');
      expect(result).toContain('3000');
    });

    it('should generate HTTP main for Fastify', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'fastify' };
      const result = generateMainTs(config);

      expect(result).toContain('FastifyStruktosAdapter');
      expect(result).toContain('Fastify');
    });

    it('should generate gRPC main for gRPC framework', () => {
      const config: ProjectConfig = { ...baseConfig, framework: 'grpc' };
      const result = generateMainTs(config);

      expect(result).toContain('createGrpcAdapter');
      expect(result).toContain('GrpcContextData');
      expect(result).toContain('50051');
    });
  });

  describe('generateHttpMain', () => {
    it('should include StruktosApp import', () => {
      const result = generateHttpMain(baseConfig);
      expect(result).toContain("StruktosApp");
      expect(result).toContain("'@struktos/core'");
    });

    it('should include middleware setup', () => {
      const result = generateHttpMain(baseConfig);
      expect(result).toContain('LoggingMiddleware');
      expect(result).toContain('TimingMiddleware');
    });

    it('should include auth middleware when useAuth is true', () => {
      const config: ProjectConfig = { ...baseConfig, useAuth: true };
      const result = generateHttpMain(config);

      expect(result).toContain('AuthMiddleware');
      expect(result).toContain('JwtService');
      expect(result).toContain('JWT_SECRET');
    });

    it('should not include auth middleware when useAuth is false', () => {
      const result = generateHttpMain(baseConfig);
      expect(result).not.toContain('AuthMiddleware');
    });

    it('should include health check route', () => {
      const result = generateHttpMain(baseConfig);
      expect(result).toContain("/health");
      expect(result).toContain("status: 'ok'");
    });

    it('should include graceful shutdown', () => {
      const result = generateHttpMain(baseConfig);
      expect(result).toContain('SIGINT');
      expect(result).toContain('app.stop()');
    });

    it('should include project name in comments', () => {
      const result = generateHttpMain(baseConfig);
      expect(result).toContain('test-app');
    });
  });

  describe('generateGrpcMain', () => {
    const grpcConfig: ProjectConfig = {
      ...baseConfig,
      framework: 'grpc',
    };

    it('should import gRPC adapter', () => {
      const result = generateGrpcMain(grpcConfig);
      expect(result).toContain("createGrpcAdapter");
      expect(result).toContain('@struktos/adapter-grpc');
    });

    it('should include gRPC interceptors', () => {
      const result = generateGrpcMain(grpcConfig);
      expect(result).toContain('createLoggingInterceptor');
      expect(result).toContain('createTimeoutInterceptor');
    });

    it('should use GrpcContextData generic', () => {
      const result = generateGrpcMain(grpcConfig);
      expect(result).toContain('StruktosApp.create<GrpcContextData>');
    });

    it('should set GRPC_PORT environment variable', () => {
      const result = generateGrpcMain(grpcConfig);
      expect(result).toContain('GRPC_PORT');
      expect(result).toContain("'50051'");
    });

    it('should enable cancellation', () => {
      const result = generateGrpcMain(grpcConfig);
      expect(result).toContain('enableCancellation: true');
    });

    it('should include lifecycle hooks', () => {
      const result = generateGrpcMain(grpcConfig);
      expect(result).toContain('onContextCreated');
      expect(result).toContain('onRequestComplete');
    });

    it('should include registerServices function', () => {
      const result = generateGrpcMain(grpcConfig);
      expect(result).toContain('async function registerServices');
    });

    it('should include auth when useAuth is true', () => {
      const config: ProjectConfig = { ...grpcConfig, useAuth: true };
      const result = generateGrpcMain(config);

      expect(result).toContain('AuthMiddleware');
      expect(result).toContain('JwtService');
    });
  });
});