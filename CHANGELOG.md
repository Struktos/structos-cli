# Changelog

All notable changes to `@struktos/cli` will be documented in this file.

## [0.2.0] - 2024-12-11

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

## [0.1.1] - 2024-12-08

### Added
- `struktos generate entity` command
- Entity generator with typed fields
- Repository interface and implementation generator
- Use case generator (CRUD operations)
- Field parser for command line definitions

---

## [0.1.0] - 2024-12-07

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

### 0.3.0 (Planned)
- [ ] `struktos generate middleware` command
- [ ] `struktos generate use-case` command
- [ ] Proto file validation
- [ ] gRPC client generation

### 0.4.0 (Planned)
- [ ] `struktos deploy` command
- [ ] Kubernetes manifest generation
- [ ] CI/CD pipeline templates

---

## Links

- [NPM Package](https://www.npmjs.com/package/@struktos/cli)
- [GitHub Repository](https://github.com/struktosjs/cli)
- [@struktos/core](https://www.npmjs.com/package/@struktos/core)
- [@struktos/adapter-grpc](https://www.npmjs.com/package/@struktos/adapter-grpc)

---

## License

MIT © Struktos.js Team