/**
 * New Generators Unit Tests (v0.3.1)
 * 
 * Tests for middleware, use-case, and client generators.
 */

import {
  generateMiddleware,
  generateLoggingMiddleware,
  generateTimingMiddleware,
} from '../../src/generators/middlewareGenerator';

import { generateUseCase } from '../../src/generators/useCaseGenerator';

import {
  generateGrpcClientAdapter,
  generateClientPortInterface,
} from '../../src/generators/clientGenerator';

describe('middlewareGenerator', () => {
  describe('generateMiddleware', () => {
    it('should generate a valid middleware class', () => {
      const result = generateMiddleware('auth');

      expect(result).toContain('export class AuthMiddleware');
      expect(result).toContain('implements IStruktosMiddleware');
      expect(result).toContain('async invoke(ctx: MiddlewareContext');
      expect(result).toContain('Promise<void>');
    });

    it('should include context traceId usage', () => {
      const result = generateMiddleware('logging');

      expect(result).toContain("ctx.context.get('traceId'");
    });

    it('should include async/await pattern', () => {
      const result = generateMiddleware('test');

      expect(result).toContain('await next()');
      expect(result).toContain('try {');
      expect(result).toContain('catch (error)');
    });

    it('should include factory function', () => {
      const result = generateMiddleware('custom');

      expect(result).toContain('export function createCustomMiddleware');
    });

    it('should use correct naming conventions', () => {
      const result = generateMiddleware('requestValidation');

      expect(result).toContain('RequestValidationMiddleware');
      expect(result).toContain('createRequestValidationMiddleware');
    });
  });

  describe('generateLoggingMiddleware', () => {
    it('should generate logging middleware with options', () => {
      const result = generateLoggingMiddleware();

      expect(result).toContain('LoggingMiddleware');
      expect(result).toContain('LoggingOptions');
      expect(result).toContain('logRequests');
      expect(result).toContain('logResponses');
      expect(result).toContain('logErrors');
    });

    it('should include sensitive field sanitization', () => {
      const result = generateLoggingMiddleware();

      expect(result).toContain('sensitiveFields');
      expect(result).toContain('[REDACTED]');
    });

    it('should include JSON structured logging', () => {
      const result = generateLoggingMiddleware();

      expect(result).toContain('JSON.stringify');
      expect(result).toContain('traceId');
    });
  });

  describe('generateTimingMiddleware', () => {
    it('should generate timing middleware with thresholds', () => {
      const result = generateTimingMiddleware();

      expect(result).toContain('TimingMiddleware');
      expect(result).toContain('warnThresholdMs');
      expect(result).toContain('errorThresholdMs');
    });

    it('should include timing metrics interface', () => {
      const result = generateTimingMiddleware();

      expect(result).toContain('TimingMetrics');
      expect(result).toContain('duration');
      expect(result).toContain("'ok' | 'slow' | 'critical'");
    });

    it('should use try/finally pattern for timing', () => {
      const result = generateTimingMiddleware();

      expect(result).toContain('try {');
      expect(result).toContain('} finally {');
    });
  });
});

describe('useCaseGenerator', () => {
  describe('generateUseCase', () => {
    it('should generate a valid use case class', () => {
      const result = generateUseCase('create', 'user');

      expect(result).toContain('export class CreateUserUseCase');
      expect(result).toContain('async execute(');
      expect(result).toContain('RequestContext');
    });

    it('should include input and output DTOs', () => {
      const result = generateUseCase('get', 'product');

      expect(result).toContain('GetProductInput');
      expect(result).toContain('GetProductOutput');
    });

    it('should include repository injection when enabled', () => {
      const result = generateUseCase('list', 'order', { withRepository: true });

      expect(result).toContain('IOrderRepository');
      expect(result).toContain('orderRepository');
    });

    it('should include logger injection when enabled', () => {
      const result = generateUseCase('update', 'item', { withLogger: true });

      expect(result).toContain('ILogger');
      expect(result).toContain('logger');
      expect(result).toContain('this.logger.info');
    });

    it('should include validation when enabled', () => {
      const result = generateUseCase('delete', 'user', { withValidation: true });

      expect(result).toContain('private validate(');
      expect(result).toContain('throw new Error');
    });

    it('should skip repository when disabled', () => {
      const result = generateUseCase('create', 'user', { withRepository: false });

      expect(result).not.toContain('IUserRepository');
    });

    it('should generate appropriate implementation for create action', () => {
      const result = generateUseCase('create', 'product');

      expect(result).toContain('Product.create(input)');
      expect(result).toContain('productRepository.create(entity)');
    });

    it('should generate appropriate implementation for list action', () => {
      const result = generateUseCase('list', 'item');

      expect(result).toContain('findAll()');
      expect(result).toContain('hasMore');
      expect(result).toContain('total');
    });

    it('should generate appropriate implementation for delete action', () => {
      const result = generateUseCase('delete', 'record');

      expect(result).toContain('delete(');
      expect(result).toContain('success');
      expect(result).toContain('deletedId');
    });

    it('should include factory function', () => {
      const result = generateUseCase('create', 'user');

      expect(result).toContain('export function createCreateUserUseCase');
    });
  });
});

describe('clientGenerator', () => {
  describe('generateGrpcClientAdapter', () => {
    it('should generate a valid client adapter class', () => {
      const result = generateGrpcClientAdapter('user');

      expect(result).toContain('export class UserClientAdapter');
      expect(result).toContain('implements IUserClientPort');
    });

    it('should include CRUD methods', () => {
      const result = generateGrpcClientAdapter('product');

      expect(result).toContain('async get(context');
      expect(result).toContain('async list(context');
      expect(result).toContain('async create(context');
      expect(result).toContain('async update(');
      expect(result).toContain('async delete(context');
    });

    it('should include gRPC metadata creation', () => {
      const result = generateGrpcClientAdapter('order');

      expect(result).toContain('createMetadata');
      expect(result).toContain('new Metadata()');
      expect(result).toContain('x-request-id');
      expect(result).toContain('x-trace-id');
    });

    it('should include error handling', () => {
      const result = generateGrpcClientAdapter('item');

      expect(result).toContain('handleError');
      expect(result).toContain('NOT_FOUND');
      expect(result).toContain('PERMISSION_DENIED');
      expect(result).toContain('UNAUTHENTICATED');
    });

    it('should include context propagation', () => {
      const result = generateGrpcClientAdapter('service');

      expect(result).toContain("context.get('traceId')");
      expect(result).toContain("context.get('userId')");
      expect(result).toContain("context.get('authorization')");
    });

    it('should include DTOs', () => {
      const result = generateGrpcClientAdapter('user');

      expect(result).toContain('UserResponse');
      expect(result).toContain('UserFilter');
      expect(result).toContain('UserListResponse');
      expect(result).toContain('CreateUserInput');
      expect(result).toContain('UpdateUserInput');
    });

    it('should include factory function', () => {
      const result = generateGrpcClientAdapter('user');

      expect(result).toContain('export function createUserClientAdapter');
    });

    it('should include static createFromProto method', () => {
      const result = generateGrpcClientAdapter('user');

      expect(result).toContain('static async createFromProto');
      expect(result).toContain('protoLoader.load');
    });
  });

  describe('generateClientPortInterface', () => {
    it('should generate port interface', () => {
      const result = generateClientPortInterface('user');

      expect(result).toContain('export interface IUserClientPort');
    });

    it('should include all CRUD method signatures', () => {
      const result = generateClientPortInterface('product');

      expect(result).toContain('get(context: RequestContext, id: string)');
      expect(result).toContain('list(context: RequestContext, filter?');
      expect(result).toContain('create(context: RequestContext, data:');
      expect(result).toContain('update(context: RequestContext, id: string, data:');
      expect(result).toContain('delete(context: RequestContext, id: string)');
    });

    it('should include DTOs', () => {
      const result = generateClientPortInterface('order');

      expect(result).toContain('OrderDto');
      expect(result).toContain('OrderFilterDto');
      expect(result).toContain('OrderListDto');
      expect(result).toContain('CreateOrderDto');
      expect(result).toContain('UpdateOrderDto');
    });

    it('should include JSDoc comments', () => {
      const result = generateClientPortInterface('item');

      expect(result).toContain('* Get a single Item by ID');
      expect(result).toContain('* List Items with optional filtering');
      expect(result).toContain('@param context');
    });
  });
});