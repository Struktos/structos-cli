# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-12-08

### Added

#### Code Generator
- **`struktos generate entity` command** - Generate complete Hexagonal Architecture
- **Entity Generator** - Create domain entities with typed fields
- **Repository Generator** - Generate repository interfaces and implementations
- **Use Case Generator** - Auto-generate 5 CRUD use cases (Create, Get, List, Update, Delete)
- **Field Parser** - Parse field definitions from command line
- **Type Safety** - Full TypeScript type generation
- **Smart Validation** - Automatic validation logic based on field types
  - Email format validation
  - Price/Amount positive validation
  - Required field validation

#### New Files
- `src/commands/generate.ts` - Main generate command implementation
- `src/generators/entityGenerator.ts` - Entity and repository generator
- `src/generators/useCaseGenerator.ts` - Use case generator for CRUD operations
- `src/utils/fieldParser.ts` - Field definition parser utility

#### Features
- Support for 6 TypeScript types: `string`, `number`, `boolean`, `Date`, `any`, `unknown`
- Optional field support with `?` suffix (e.g., `description:string?`)
- Automatic ID field generation if not specified
- Hexagonal Architecture enforcement
- In-Memory repository implementation for quick start
- PascalCase, camelCase, kebab-case auto-conversion

#### Documentation
- `GENERATE_COMMAND.md` - Complete usage guide for code generator
- `CODEGEN_IMPLEMENTATION_COMPLETE.md` - Implementation details
- `PHASE2_SUMMARY.md` - Phase 2 summary and statistics

### Changed
- Updated CLI help text to include `generate` command
- Version bumped from 0.1.0 to 0.1.1

### Technical Details

**Generated Files per Entity (8 files):**
1. `src/domain/entities/[Name].entity.ts` - Domain entity
2. `src/domain/repositories/I[Name]Repository.ts` - Repository interface
3. `src/infrastructure/adapters/persistence/[Name].repository.ts` - Repository implementation
4. `src/application/use-cases/create-[name].usecase.ts` - Create use case
5. `src/application/use-cases/get-[name].usecase.ts` - Get use case
6. `src/application/use-cases/list-[name]s.usecase.ts` - List use case
7. `src/application/use-cases/update-[name].usecase.ts` - Update use case
8. `src/application/use-cases/delete-[name].usecase.ts` - Delete use case

**Usage Examples:**
```bash
# Basic entity
struktos generate entity Product --fields="name:string,price:number"

# With optional fields
struktos g entity User --fields="username:string,email:string,bio:string?"

# Complex entity
struktos g entity Order --fields="userId:string,amount:number,status:string,createdAt:Date"
```

### Statistics
- New commands: 1 (`generate`)
- New files: 4
- Lines of code added: ~1,000
- Files generated per entity: 8
- Supported types: 6
- Time saved per entity: 2-3 hours → 5 seconds

### Breaking Changes
None - This release is fully backward compatible with v0.1.0

---

## [0.1.0] - 2024-12-07

### Added

#### Project Generator
- **`struktos new` command** - Create new Struktos.js projects
- **Interactive prompts** - Inquirer.js-based configuration
- **Hexagonal Architecture scaffolding** - Automatic folder structure creation
- **Framework selection** - Express (Fastify and Koa coming soon)
- **Persistence layer selection** - PostgreSQL, MongoDB, or None
- **Authentication integration** - Optional @struktos/auth inclusion
- **Auto-configuration** - Automatic package.json and tsconfig.json generation
- **Starter code** - Ready-to-run application code

#### Features
- Zero-configuration defaults
- Colored CLI output with Chalk
- Loading spinners with Ora
- Smart dependency management
- Environment variable templates
- Complete documentation generation
- Example entity and repository

#### Files
- `src/commands/new.ts` - Project creation command
- `src/generators/packageJson.ts` - package.json generator
- `src/generators/appTs.ts` - Application code generator
- `src/generators/configFiles.ts` - Configuration file generators
- `src/utils/prompts.ts` - Interactive prompt utilities
- `src/utils/project.ts` - Project structure utilities
- `src/types.ts` - TypeScript type definitions
- `src/index.ts` - CLI entry point

#### Documentation
- `README.md` - Complete usage documentation
- `LICENSE` - MIT license
- `.npmignore` - NPM publish configuration

### Technical Details

**Generated Project Structure:**
```
project-name/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── application/
│   │   ├── use-cases/
│   │   └── ports/
│   ├── infrastructure/
│   │   └── adapters/
│   │       ├── http/
│   │       └── persistence/
│   └── common/
│       ├── types/
│       └── utils/
├── tests/
├── config/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

**Dependencies:**
- Core: `@struktos/core`, `@struktos/adapter-express`, `express`
- Auth (optional): `@struktos/auth`, `jsonwebtoken`, `bcryptjs`
- PostgreSQL (optional): `@prisma/client`, `prisma`
- MongoDB (optional): `mongoose`

### Statistics
- Commands: 1 (`new`)
- Generators: 3
- Utilities: 2
- Lines of code: ~800
- Project setup time: 30 minutes → 30 seconds

---

## Release Notes

### v0.1.1 Summary
The code generator release dramatically improves developer productivity by automating the creation of complete Hexagonal Architecture implementations. What previously took 2-3 hours of manual coding can now be generated in 5 seconds.

### v0.1.0 Summary
Initial release providing a complete CLI tool for scaffolding enterprise-grade Node.js applications with Struktos.js framework, Hexagonal Architecture, and optional authentication.

---

## Links

- [NPM Package](https://www.npmjs.com/package/@struktos/cli)
- [GitHub Repository](https://github.com/struktosjs/cli)
- [Documentation](https://github.com/struktosjs/cli#readme)
- [Issue Tracker](https://github.com/struktosjs/cli/issues)

---

## Contributors

- Struktos.js Team

---

## License

MIT © Struktos.js Team