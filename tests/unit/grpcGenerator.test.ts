/**
 * gRPC Generator Unit Tests
 */

import {
  generateProtoFile,
  generateGrpcServiceHandler,
  generateServiceRegistration,
} from '../../src/generators/grpcGenerator';

describe('grpcGenerator', () => {
  describe('generateProtoFile', () => {
    it('should generate valid proto file with all methods', () => {
      const proto = generateProtoFile('user', ['get', 'list', 'create', 'update', 'delete']);

      // Check syntax
      expect(proto).toContain('syntax = "proto3"');
      
      // Check package
      expect(proto).toContain('package user');
      
      // Check service name
      expect(proto).toContain('service UserService');
      
      // Check methods
      expect(proto).toContain('rpc GetUser');
      expect(proto).toContain('rpc ListUsers');
      expect(proto).toContain('rpc CreateUser');
      expect(proto).toContain('rpc UpdateUser');
      expect(proto).toContain('rpc DeleteUser');
      
      // Check messages
      expect(proto).toContain('message User');
      expect(proto).toContain('message GetUserRequest');
      expect(proto).toContain('message CreateUserRequest');
    });

    it('should generate streaming for list method', () => {
      const proto = generateProtoFile('product', ['list']);

      expect(proto).toContain('returns (stream Product)');
    });

    it('should generate proto with only selected methods', () => {
      const proto = generateProtoFile('order', ['get', 'create']);

      expect(proto).toContain('rpc GetOrder');
      expect(proto).toContain('rpc CreateOrder');
      expect(proto).not.toContain('rpc ListOrders');
      expect(proto).not.toContain('rpc UpdateOrder');
      expect(proto).not.toContain('rpc DeleteOrder');
    });

    it('should use snake_case for package name', () => {
      const proto = generateProtoFile('userProfile', ['get']);

      expect(proto).toContain('package user_profile');
    });

    it('should use PascalCase for service and message names', () => {
      const proto = generateProtoFile('orderItem', ['get']);

      expect(proto).toContain('service OrderItemService');
      expect(proto).toContain('message OrderItem');
      expect(proto).toContain('message GetOrderItemRequest');
    });

    it('should include standard fields in entity message', () => {
      const proto = generateProtoFile('user', ['get']);

      expect(proto).toContain('string id = 1');
      expect(proto).toContain('string name = 2');
      expect(proto).toContain('string description = 3');
      expect(proto).toContain('int64 created_at = 4');
      expect(proto).toContain('int64 updated_at = 5');
    });

    it('should include delete response message', () => {
      const proto = generateProtoFile('user', ['delete']);

      expect(proto).toContain('message DeleteUserResponse');
      expect(proto).toContain('bool success = 1');
      expect(proto).toContain('string message = 2');
    });
  });

  describe('generateGrpcServiceHandler', () => {
    it('should generate valid service handler with all methods', () => {
      const handler = generateGrpcServiceHandler('user', ['get', 'list', 'create', 'update', 'delete']);

      // Check imports
      expect(handler).toContain("import { RequestContext } from '@struktos/core'");
      expect(handler).toContain("import { GrpcContextData } from '@struktos/adapter-grpc'");
      
      // Check service export
      expect(handler).toContain('export const userService');
      
      // Check methods
      expect(handler).toContain('GetUser:');
      expect(handler).toContain('ListUsers:');
      expect(handler).toContain('CreateUser:');
      expect(handler).toContain('UpdateUser:');
      expect(handler).toContain('DeleteUser:');
    });

    it('should include context propagation', () => {
      const handler = generateGrpcServiceHandler('user', ['get']);

      expect(handler).toContain('RequestContext.current<GrpcContextData>()');
      expect(handler).toContain("ctx?.get('traceId')");
    });

    it('should generate streaming handler for list method', () => {
      const handler = generateGrpcServiceHandler('product', ['list']);

      expect(handler).toContain('ListProducts:');
      expect(handler).toContain('call.write(');
      expect(handler).toContain('call.end()');
    });

    it('should generate register function', () => {
      const handler = generateGrpcServiceHandler('user', ['get']);

      expect(handler).toContain('export async function registerUserService');
      expect(handler).toContain('adapter.addProtoService');
      expect(handler).toContain('user.UserService');
    });

    it('should use correct naming conventions', () => {
      const handler = generateGrpcServiceHandler('orderItem', ['get']);

      expect(handler).toContain('export const orderItemService');
      expect(handler).toContain('registerOrderItemService');
      expect(handler).toContain('order_item.OrderItemService');
    });
  });

  describe('generateServiceRegistration', () => {
    it('should generate registration example', () => {
      const registration = generateServiceRegistration('user');

      expect(registration).toContain('registerUserService');
      expect(registration).toContain('user.proto');
      expect(registration).toContain("import * as path from 'path'");
    });

    it('should include example usage comments', () => {
      const registration = generateServiceRegistration('product');

      expect(registration).toContain('Example usage in main.ts');
      expect(registration).toContain('StruktosApp');
      expect(registration).toContain('createGrpcAdapter');
    });
  });
});