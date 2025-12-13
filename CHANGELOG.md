# Changelog

All notable changes to `@struktos/cli` will be documented in this file.

## [0.3.0] - 2025-12-11

### 🎉 Major Release - Pure TypeScript Generators

This release adds three new generators for middleware/interceptors, use cases, and gRPC clients - all using pure TypeScript classes without decorators.

### Added

#### `struktos generate middleware` Command (New!)
- **Aliases**: `struktos g mw`, `struktos generate mw`
- **Purpose**: Generate middleware/interceptor classes for the middleware pipeline
- **Templates**:
  - `--logging`: Comprehensive logging interceptor with structured JSON output
  - `--timing`: Performance monitoring interceptor with configurable thresholds
  - Default: Custom interceptor template

**Generated Files:**
```
src/infrastructure/middleware/<name>.interceptor.ts
```

**Features:**
- Pure TypeScript class implementing `IInterceptor`
- RxJS-based request/response flow handling
- Context propagation with trace ID
- Factory function for easy instantiation
- Pre/post processing hooks
- Error handling with `catchError`

#### `struktos generate use-case` Command (New!)
- **Aliases**: `struktos g uc`
- **Syntax**: `struktos generate use-case <action> --entity=<entity>`
- **Purpose**: Generate Clean Architecture use case classes

**Supported Actions:**
- `create` - Create entity with validation
- `get` / `find` - Retrieve entity by ID
- `list` / `search` - Paginated list with filters
- `update` - Update existing entity
- `delete` - Delete entity (soft/hard)

**Options:**
- `--no-repository`: Skip repository injection
- `--no-logger`: Skip logger injection
- `--no-validation`: Skip validation logic

**Generated Files:**
```
src/application/use-cases/<entity>/<action>-<entity>.use-case.ts
```

**Features:**
- Input/Output DTOs with TypeScript interfaces
- Constructor dependency injection
- `execute(context, input)` pattern
- Automatic validation logic
- Logger integration with trace ID
- Sensitive field sanitization
- Factory function

#### `struktos generate client` Command (New!)
- **Syntax**: `struktos generate client <service> [--with-port]`
- **Purpose**: Generate gRPC client adapters for microservice communication

**Generated Files:**
```
src/infrastructure/adapters/grpc/<service>.client.adapter.ts
src/application/ports/grpc/<service>.client.port.ts  (with --with-port)
```

**Features:**
- Full CRUD method implementations
- gRPC Metadata creation with context propagation
- Trace ID, User ID, Authorization header forwarding
- Error handling with gRPC status code mapping
- Response mapping helpers
- Port interface generation
- Static `createFromProto` factory method
- TypeScript DTOs for all operations

### Changed
- All generated code is **pure TypeScript** - no decorators required
- Explicit constructor dependency injection
- Interface-based contracts for all components
- Factory functions provided for all classes

### Statistics
- New commands: 3 (`generate middleware`, `generate use-case`, `generate client`)
- New generators: 5 (middleware, logging, timing, use-case, client)
- New tests: 33
- Total tests: 160
- Lines of code added: ~2,000

---

## [0.2.0] - 2025-12-11

### 🎉 Major Release - gRPC Support

This release adds full gRPC support to the Struktos CLI, enabling microservice development.

### Added

#### `struktos new` Updates
- **gRPC Framework Option**: Select "gRPC - Microservices with Protocol Buffers" when creating a new project
- **gRPC Project Template**: Complete gRPC server setup with:
  - `@struktos/adapter-grpc` integration
  - Middleware pipeline (logging, timeout interceptors)
  - Context propagation and cancellation handling
  - Health check service example
  - Proto directory structure

#### `struktos generate service` Command (New!)
- **gRPC Service Generation**: `struktos generate service <n> --type=grpc`
  - `.proto` file with service and message definitions
  - Service handler with method implementations
  - Registration helper for easy integration
  - Support for 5 method types: get, list (streaming), create, update, delete

- **HTTP Service Generation**: `struktos generate service <n> --type=http`
  - Controller with route handlers
  - Route registration helper

#### Generated gRPC Files

For `struktos generate service user --type=grpc`:

1. **protos/user.proto**
   - Complete Protocol Buffer definition
   - Service with CRUD methods
   - Request/Response messages
   - Server streaming for list operations

2. **src/infrastructure/adapters/grpc/user.service.grpc.ts**
   - Service implementation handlers
   - RequestContext integration
   - Trace ID propagation
   - Ready for use case integration

3. **src/infrastructure/adapters/grpc/user.registration.ts**
   - Service registration helper
   - Example main.ts integration code

### Changed
- Updated project structure to include `protos/` directory for gRPC projects
- Updated project structure to include `src/infrastructure/adapters/grpc/` directory
- Enhanced `generateMainTs` to support both HTTP and gRPC frameworks
- Improved interactive prompts with gRPC option

### Technical Details

**gRPC main.ts Features:**
- `StruktosApp` with `GrpcContextData` generic
- `createGrpcAdapter` with cancellation support
- `createLoggingInterceptor` and `createTimeoutInterceptor`
- Lifecycle hooks for context creation/completion
- Graceful shutdown handling

**Proto File Features:**
- Package naming convention (`snake_case`)
- CRUD method definitions
- Server streaming for list operations
- Standard request/response message patterns

### Statistics
- New commands: 1 (`generate service`)
- Updated commands: 2 (`new`, `generate entity`)
- New generators: 3 (proto, grpc handler, registration)
- Lines of code added: ~1,500

---

## [0.1.1] - 2025-12-08

### Added
- `struktos generate entity` command
- Entity generator with typed fields
- Repository interface and implementation generator
- Use case generator (CRUD operations)
- Field parser for command line definitions

---

## [0.1.0] - 2025-12-07

### Added
- Initial release
- `struktos new` command for project creation
- Interactive prompts for configuration
- Hexagonal Architecture scaffolding
- Express, Fastify, NestJS framework support
- PostgreSQL, MongoDB persistence options
- Authentication integration option
- Docker configuration generation

---

## Roadmap

### 0.4.0 (Planned)
- [ ] `struktos generate repository` command
- [ ] Proto file validation
- [ ] gRPC streaming client support
- [ ] Event sourcing templates

### 0.5.0 (Planned)
- [ ] `struktos deploy` command
- [ ] Kubernetes manifest generation
- [ ] CI/CD pipeline templates
- [ ] Health check and metrics integration

---

## Links

- [NPM Package](https://www.npmjs.com/package/@struktos/cli)
- [GitHub Repository](https://github.com/struktosjs/cli)
- [@struktos/core](https://www.npmjs.com/package/@struktos/core)
- [@struktos/adapter-grpc](https://www.npmjs.com/package/@struktos/adapter-grpc)

---

## License

MIT © Struktos.js Team