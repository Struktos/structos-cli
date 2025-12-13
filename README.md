# @struktos/cli

> CLI tool for creating and managing Struktos.js projects with HTTP and gRPC support

[![npm version](https://img.shields.io/npm/v/@struktos/cli.svg)](https://www.npmjs.com/package/@struktos/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

```bash
# Install globally
npm install -g @struktos/cli

# Create a new project
struktos new my-app

# Or use npx
npx @struktos/cli new my-app
```

## 📋 Commands

### `struktos new [name]`

Create a new Struktos.js project with interactive prompts.

```bash
struktos new my-api
```

**Options:**
- Framework: Express, Fastify, NestJS, or **gRPC** (new!)
- Persistence: PostgreSQL, MongoDB, or None
- Authentication: Optional @struktos/auth integration
- Docker: Optional Docker configuration

#### Creating a gRPC Microservice

```bash
struktos new my-service
# Select "gRPC - Microservices with Protocol Buffers" when prompted
```

This generates a complete gRPC server setup:

```
my-service/
├── src/
│   ├── main.ts              # gRPC server entry point
│   ├── domain/
│   ├── application/
│   └── infrastructure/
│       └── adapters/
│           └── grpc/        # gRPC service handlers
├── protos/                  # Protocol Buffer definitions
│   └── health.proto
├── package.json
└── README.md
```

### `struktos generate entity <name>`

Generate a complete entity with Hexagonal Architecture:

```bash
struktos generate entity Product --fields="name:string,price:number"
# or short form
struktos g entity Product -f "name:string,price:number"
```

**Generated files:**
- `src/domain/entities/Product.entity.ts`
- `src/domain/repositories/IProductRepository.ts`
- `src/infrastructure/adapters/persistence/Product.repository.ts`

### `struktos generate service <name>` (New!)

Generate a service with handlers for HTTP or gRPC.

#### gRPC Service

```bash
struktos generate service user --type=grpc
# or with specific methods
struktos g service user -t grpc -m "get,list,create,update,delete"
```

**Generated files:**
- `protos/user.proto` - Protocol Buffer definition
- `src/infrastructure/adapters/grpc/user.service.grpc.ts` - Service handler
- `src/infrastructure/adapters/grpc/user.registration.ts` - Registration example

**Generated proto file:**

```protobuf
syntax = "proto3";
package user;

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
  rpc CreateUser (CreateUserRequest) returns (User);
  rpc UpdateUser (UpdateUserRequest) returns (User);
  rpc DeleteUser (DeleteUserRequest) returns (DeleteUserResponse);
}

message User {
  string id = 1;
  string name = 2;
  string description = 3;
  int64 created_at = 4;
  int64 updated_at = 5;
}
// ... request/response messages
```

**Generated handler:**

```typescript
import { RequestContext } from '@struktos/core';
import { GrpcContextData } from '@struktos/adapter-grpc';

export const userService = {
  GetUser: (call, callback) => {
    const ctx = RequestContext.current<GrpcContextData>();
    const traceId = ctx?.get('traceId');
    // Implementation...
  },
  // ... other methods
};
```

#### HTTP Service

```bash
struktos generate service product --type=http
```

**Generated files:**
- `src/infrastructure/adapters/http/product.controller.ts`

### `struktos generate middleware <n>` (New in v0.3.0!)

Generate middleware/interceptor classes with pure TypeScript.

```bash
# Custom middleware
struktos generate middleware auth
struktos g mw requestValidator

# Logging template
struktos g mw logging --logging

# Timing/performance template
struktos g mw timing --timing
```

**Generated files:**
- `src/infrastructure/middleware/<n>.interceptor.ts`

**Example generated interceptor:**

```typescript
import { RequestContext, IInterceptor, NextFn } from '@struktos/core';
import { Observable, tap, catchError } from 'rxjs';

export class AuthInterceptor implements IInterceptor {
  intercept(context: RequestContext, next: NextFn): Observable<any> {
    const traceId = context.get('traceId');
    console.log(`[AuthInterceptor] Processing request ${traceId}`);
    
    return next().pipe(
      tap(() => console.log(`[AuthInterceptor] Request completed`)),
      catchError((error) => { throw error; })
    );
  }
}
```

### `struktos generate use-case <action>` (New in v0.3.0!)

Generate use case classes following Clean Architecture patterns.

```bash
# Create use case
struktos generate use-case create --entity=user
struktos g uc create -e user

# Get use case
struktos g uc get -e product

# List use case
struktos g uc list -e order

# With options
struktos g uc delete -e item --no-logger --no-validation
```

**Options:**
- `-e, --entity <entity>`: Entity name (required)
- `--no-repository`: Skip repository injection
- `--no-logger`: Skip logger injection  
- `--no-validation`: Skip validation logic

**Generated files:**
- `src/application/use-cases/<entity>/<action>-<entity>.use-case.ts`

**Example generated use case:**

```typescript
import { RequestContext, ILogger } from '@struktos/core';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(context: RequestContext, input: CreateUserInput): Promise<CreateUserOutput> {
    this.logger.info(`Starting user creation`, { traceId: context.get('traceId') });
    
    this.validate(input);
    const user = await this.userRepository.create(input);
    
    return { user };
  }
}
```

### `struktos generate client <service>` (New in v0.3.0!)

Generate gRPC client adapters for microservice communication.

```bash
# Generate client adapter
struktos generate client user-service

# Also generate port interface
struktos g client order-service --with-port
```

**Options:**
- `--with-port`: Also generate the port interface

**Generated files:**
- `src/infrastructure/adapters/grpc/<service>.client.adapter.ts`
- `src/application/ports/grpc/<service>.client.port.ts` (with `--with-port`)

**Example generated client adapter:**

```typescript
import { RequestContext } from '@struktos/core';
import { Metadata } from '@grpc/grpc-js';

export class UserServiceClientAdapter implements IUserServiceClientPort {
  constructor(private readonly grpcClientFactory: IGrpcClientFactory) {
    this.userService = this.grpcClientFactory.getService('UserService');
  }

  async get(context: RequestContext, id: string): Promise<UserResponse> {
    const metadata = this.createMetadata(context); // Propagates trace ID
    return this.userService.GetUser({ id }, metadata);
  }

  private createMetadata(context: RequestContext): Metadata {
    const metadata = new Metadata();
    metadata.set('x-trace-id', context.get('traceId'));
    metadata.set('x-user-id', context.get('userId'));
    return metadata;
  }
}
```

## 🏗️ Project Structure

Generated projects follow **Hexagonal Architecture**:

```
project/
├── src/
│   ├── domain/              # Business logic
│   │   ├── entities/        # Domain entities
│   │   ├── repositories/    # Repository interfaces
│   │   └── services/        # Domain services
│   ├── application/         # Application logic
│   │   ├── use-cases/       # Use cases
│   │   └── ports/           # Port interfaces
│   ├── infrastructure/      # External adapters
│   │   └── adapters/
│   │       ├── http/        # HTTP controllers
│   │       ├── grpc/        # gRPC handlers
│   │       └── persistence/ # Repository implementations
│   └── main.ts              # Entry point
├── protos/                  # Protocol Buffers (gRPC only)
├── tests/
└── config/
```

## 📡 gRPC Support

### main.ts (gRPC Project)

```typescript
import { StruktosApp } from '@struktos/core';
import {
  createGrpcAdapter,
  createLoggingInterceptor,
  GrpcContextData,
} from '@struktos/adapter-grpc';

async function main() {
  const app = StruktosApp.create<GrpcContextData>({
    name: 'my-service',
  });

  app.use(createLoggingInterceptor());

  const adapter = createGrpcAdapter({
    enableCancellation: true,
  });

  // Register services
  await registerServices(adapter);

  await app.listen(adapter, 50051);
  console.log('gRPC server running on port 50051');
}
```

### Registering a Service

```typescript
import { registerUserService } from './infrastructure/adapters/grpc/user.service.grpc';

async function registerServices(adapter) {
  await registerUserService(adapter, './protos/user.proto');
}
```

## 🔧 Supported Types

For entity field definitions:

| Type | Example |
|------|---------|
| `string` | `name:string` |
| `number` | `price:number` |
| `boolean` | `isActive:boolean` |
| `Date` | `createdAt:Date` |
| `any` | `metadata:any` |
| `unknown` | `data:unknown` |

Optional fields use `?` suffix: `description:string?`

## 📦 Framework Support

| Framework | Type | Command |
|-----------|------|---------|
| Express | HTTP | `struktos new app` → Select Express |
| Fastify | HTTP | `struktos new app` → Select Fastify |
| NestJS | HTTP | `struktos new app` → Select NestJS |
| **gRPC** | RPC | `struktos new app` → Select gRPC |

## 🐳 Docker Support

Generated projects include Docker configuration:

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app
```

## 📖 Examples

### Create a gRPC Microservice with User Service

```bash
# 1. Create project
struktos new user-service
# Select: gRPC, PostgreSQL, Yes for Auth, Yes for Docker

# 2. Navigate to project
cd user-service

# 3. Generate user service
struktos generate service user --type=grpc

# 4. Install dependencies
npm install

# 5. Start development server
npm run dev
```

### Create an Express API with Product Entity

```bash
# 1. Create project
struktos new product-api
# Select: Express, MongoDB, Yes for Auth, Yes for Docker

# 2. Navigate to project
cd product-api

# 3. Generate product entity
struktos generate entity Product --fields="name:string,price:number,description:string?"

# 4. Install dependencies
npm install

# 5. Start development server
npm run dev
```

## 🤝 Related Packages

- [@struktos/core](https://www.npmjs.com/package/@struktos/core) - Core framework
- [@struktos/adapter-express](https://www.npmjs.com/package/@struktos/adapter-express) - Express adapter
- [@struktos/adapter-fastify](https://www.npmjs.com/package/@struktos/adapter-fastify) - Fastify adapter
- [@struktos/adapter-grpc](https://www.npmjs.com/package/@struktos/adapter-grpc) - gRPC adapter
- [@struktos/auth](https://www.npmjs.com/package/@struktos/auth) - Authentication

## 📄 License

MIT © Struktos.js Team