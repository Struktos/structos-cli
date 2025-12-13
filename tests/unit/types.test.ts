/**
 * Types Unit Tests
 */

import { ADAPTERS, FrameworkType } from '../../src/types';

describe('types', () => {
  describe('ADAPTERS', () => {
    it('should have all framework types', () => {
      expect(ADAPTERS.express).toBeDefined();
      expect(ADAPTERS.fastify).toBeDefined();
      expect(ADAPTERS.nestjs).toBeDefined();
      expect(ADAPTERS.grpc).toBeDefined();
    });

    it('should have correct properties for each adapter', () => {
      const frameworks: FrameworkType[] = ['express', 'fastify', 'nestjs', 'grpc'];

      for (const framework of frameworks) {
        const adapter = ADAPTERS[framework];
        expect(adapter.name).toBeDefined();
        expect(adapter.package).toBeDefined();
        expect(adapter.defaultPort).toBeDefined();
        expect(adapter.protocol).toBeDefined();
        expect(adapter.description).toBeDefined();
      }
    });

    it('should have correct package names', () => {
      expect(ADAPTERS.express.package).toBe('@struktos/adapter-express');
      expect(ADAPTERS.fastify.package).toBe('@struktos/adapter-fastify');
      expect(ADAPTERS.nestjs.package).toBe('@struktos/adapter-nestjs');
      expect(ADAPTERS.grpc.package).toBe('@struktos/adapter-grpc');
    });

    it('should have correct default ports', () => {
      expect(ADAPTERS.express.defaultPort).toBe(3000);
      expect(ADAPTERS.fastify.defaultPort).toBe(3000);
      expect(ADAPTERS.nestjs.defaultPort).toBe(3000);
      expect(ADAPTERS.grpc.defaultPort).toBe(50051);
    });

    it('should have correct protocols', () => {
      expect(ADAPTERS.express.protocol).toBe('http');
      expect(ADAPTERS.fastify.protocol).toBe('http');
      expect(ADAPTERS.nestjs.protocol).toBe('http');
      expect(ADAPTERS.grpc.protocol).toBe('grpc');
    });

    it('gRPC adapter should have microservices description', () => {
      expect(ADAPTERS.grpc.description.toLowerCase()).toContain('microservice');
    });
  });
});