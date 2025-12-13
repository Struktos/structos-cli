# Changelog

All notable changes to `@struktos/cli` will be documented in this file.

## [0.3.3] - 2025-12-14

### 🐛 Bug Fixes

#### Entity Generation - `id` Field Duplication Fixed
- **Issue**: `generate entity Product --fields="name:string,price:number"` produced duplicate `id` fields
- **Root Cause**: CLI was adding `id` to fields array, but template also hardcoded `id`
- **Fix**: CLI now filters out reserved fields (`id`, `createdAt`, `updatedAt`) before passing to template
- **Result**: Clean entity with no duplicate constructor parameters

#### Entity Generation - `static create()` Method Fixed
- **Issue**: `static create()` had incorrect parameter count (missing trailing comma handling)
- **Fix**: Proper handling of field params with clean formatting

#### gRPC Registration - Import Path Fixed
- **Issue**: `import { registerOrderService } from './infrastructure/adapters/grpc/order.service.grpc'`
- **Should Be**: `import { registerOrderService } from './order.service.grpc'` (same directory)
- **Fix**: Changed to correct relative path for same-directory imports

#### gRPC Registration - Adapter Type Fixed  
- **Issue**: Used undefined `GrpcAdapter` type
- **Fix**: Now uses actual `GrpcStruktosAdapter` from `@struktos/adapter-grpc`

#### Metadata Configuration - Type Names Updated
- Updated `generateMetadataConfig()` to use correct @struktos/core types:
  - `IStruktosMiddleware` (was `IInterceptor`)
  - `MiddlewareContext` (was not included)
  - `NextFunction` (was `NextFn`)
- Added `adapterImports` section with `GrpcStruktosAdapter` and `createGrpcAdapter`

### Changed

- `metadata-reader.ts`: Added `AdapterImports` interface
- `configGenerator.ts`: Updated `generateMetadataConfig()` with correct types
- Tests: Added `adapterImports` test case

### Statistics
- Tests: 168 passing (+1 new test)
- Bug fixes: 4 issues resolved

---

## [0.3.1] - 2025-12-13

### 🐛 Bug Fixes & Improvements

This patch release fixes critical bugs and aligns generated code with @struktos/core interfaces.

### Fixed

#### `generate entity` - Fixed `this.` Missing in `toObject()`
- **Issue**: Generated entity's `toObject()` method was missing `this.` prefix for fields
- **Before**: `return { name, price }` (runtime error)
- **After**: `return { id: this.id, name: this.name, ... }`
- Added `id`, `createdAt`, `updatedAt` fields automatically
- Added `static create()` factory method for DDD pattern

#### `generate client` - Fixed Validation Error for Kebab-Case Names
- **Issue**: `struktos g client inventory-service` failed with "invalid entity name"
- **Fix**: Added `validateServiceName()` that allows kebab-case (`inventory-service`), snake_case (`inventory_service`), and PascalCase (`InventoryService`)

#### `generate middleware` - Fixed Core Type Alignment
- **Issue**: Generated interceptors used non-existent `IInterceptor` and RxJS Observable pattern
- **Fix**: Updated to use actual @struktos/core interfaces:
  - `IStruktosMiddleware` instead of `IInterceptor`
  - `NextFunction` instead of `NextFn`
  - `MiddlewareContext` instead of `RequestContext`
  - Promise-based `invoke()` instead of RxJS Observable `intercept()`

### Changed

#### Middleware Template Overhaul
- Renamed from `.interceptor.ts` to `.middleware.ts`
- Changed class naming from `*Interceptor` to `*Middleware`
- Replaced RxJS `Observable` pattern with async/await `Promise<void>`
- Updated factory functions: `createAuthMiddleware()` instead of `createAuthInterceptor()`

#### Entity Template Enhancement
- Added `id: string` field automatically
- Added `createdAt: Date` and `updatedAt: Date` fields
- Added `static create(data)` factory method
- `static fromObject()` now properly handles Date fields

#### Use Case Template Update
- Uses entity's `static create()` method instead of inline `crypto.randomUUID()`
- Cleaner separation of concerns

### Updated

- `metadata-reader.ts`: Updated `CoreImports` interface with correct type names
- `DEFAULT_METADATA`: Uses `IStruktosMiddleware`, `NextFunction`, `MiddlewareContext`
- Tests: Updated 167 tests to match new patterns

### Statistics
- Bug fixes: 3 critical issues resolved
- Tests: 167 passing
- No breaking changes to CLI commands

---

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
- **NEW**: Handlebars template engine for code generation
- **NEW**: `config/struktos.metadata.json` for path resolution

### Architecture Improvements

#### Handlebars Template Engine
- All generators now use `.hbs` templates in `src/templates/`
- Custom Handlebars helpers: `importPath`, `camelCase`, `pascalCase`, `kebabCase`, `snakeCase`, `pluralize`
- Template caching for improved performance
- Separation of template logic from generator logic

#### Metadata-Based Path Resolution
- `config/struktos.metadata.json` generated for each project
- Contains import paths and project structure information
- Enables accurate relative import path calculation
- Supports framework-specific configurations

### Statistics
- New commands: 3 (`generate middleware`, `generate use-case`, `generate client`)
- New generators: 5 (middleware, logging, timing, use-case, client)
- New tests: 40
- Total tests: 167
- Handlebars templates: 5 (middleware/default, middleware/logging, middleware/timing, use-case/default, client/adapter, client/port)
- Lines of code added: ~2,500

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