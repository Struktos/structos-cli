# @struktos/cli

> CLI tool for creating and managing Struktos.js projects

[![npm version](https://img.shields.io/npm/v/@struktos/cli.svg)](https://www.npmjs.com/package/@struktos/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 What is this?

`@struktos/cli` is a command-line tool that helps you quickly scaffold enterprise-grade Node.js applications using the Struktos.js framework with Hexagonal Architecture.

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @struktos/cli
```

### One-time Use (npx)

```bash
npx @struktos/cli new my-app
```

## 🚀 Quick Start

### Create a New Project

```bash
# Interactive mode
struktos new

# With project name
struktos new my-awesome-app
```

The CLI will ask you three questions:

1. **Choose Framework Adapter** - Express (more coming soon)
2. **Choose Persistence Layer** - PostgreSQL, MongoDB, or None
3. **Include Authentication?** - Yes/No

### Run Your Project

```bash
cd my-awesome-app
npm install
npm run dev
```

Your app will be running at `http://localhost:3000` 🚀

## 📋 Features

### ✅ Hexagonal Architecture

Projects are scaffolded with clean Hexagonal Architecture (Ports & Adapters):

```
src/
├── domain/              # Business logic
│   ├── entities/        # Domain models
│   ├── repositories/    # Repository interfaces (ports)
│   └── services/        # Domain services
├── application/         # Application logic
│   ├── use-cases/       # Use case implementations
│   └── ports/           # Application ports
├── infrastructure/      # External adapters
│   └── adapters/
│       ├── http/        # HTTP controllers
│       └── persistence/ # Database implementations
└── common/              # Shared utilities
    ├── types/
    └── utils/
```

### ✅ Framework Support

- **Express** ✅ Available now
- **Fastify** 🔜 Coming soon
- **Koa** 🔜 Coming soon

### ✅ Database Support

- **PostgreSQL** (with Prisma)
- **MongoDB** (with Mongoose)
- **None** (In-Memory for development)

### ✅ Built-in Authentication

Optional JWT-based authentication with [@struktos/auth](https://www.npmjs.com/package/@struktos/auth):

- User registration
- Login/logout
- Protected routes
- Role-based access control
- Claims-based authorization

### ✅ Auto-Generated Files

The CLI generates:

- ✅ `package.json` with all dependencies
- ✅ `tsconfig.json` with optimal settings
- ✅ `src/app.ts` with framework integration
- ✅ `.env.example` for environment variables
- ✅ `.gitignore` with sensible defaults
- ✅ `README.md` with project documentation
- ✅ Complete folder structure

## 🎨 Project Templates

### Express + Auth + In-Memory

```bash
struktos new my-app
# Choose: Express, None, Yes
```

Generates a project with:
- Express.js server
- @struktos/auth for authentication
- In-memory data storage
- Ready-to-use auth endpoints

### Express + PostgreSQL + Auth

```bash
struktos new my-app
# Choose: Express, PostgreSQL, Yes
```

Generates a project with:
- Express.js server
- Prisma ORM for PostgreSQL
- @struktos/auth with database persistence
- Complete authentication system

### Express + MongoDB (No Auth)

```bash
struktos new my-app
# Choose: Express, MongoDB, No
```

Generates a project with:
- Express.js server
- Mongoose ODM for MongoDB
- Clean architecture structure

## 📚 Commands

### `struktos new [project-name]`

Create a new Struktos.js project.

**Options:**
- `project-name` - Name of the project (optional, will prompt if not provided)

**Example:**
```bash
struktos new my-app
```

**Interactive Prompts:**

1. **Project name** - Enter your project name
2. **Framework** - Choose Express (more coming soon)
3. **Persistence** - Choose PostgreSQL, MongoDB, or None
4. **Authentication** - Include @struktos/auth? (Yes/No)

### `struktos --version`

Show CLI version.

### `struktos --help`

Show help information.

## 🔧 Generated Project Structure

After running `struktos new my-app`, you'll get:

```
my-app/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── User.ts              # Example entity
│   │   ├── repositories/
│   │   │   └── IUserRepository.ts   # Example repository interface
│   │   └── services/
│   ├── application/
│   │   ├── use-cases/
│   │   └── ports/
│   ├── infrastructure/
│   │   └── adapters/
│   │       ├── http/
│   │       └── persistence/
│   ├── common/
│   │   ├── types/
│   │   └── utils/
│   └── app.ts                       # Application entry point
├── tests/
│   ├── unit/
│   └── integration/
├── config/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## 🎯 What's Included

### Core Dependencies

All projects include:
- `@struktos/core` - Context propagation and caching
- `@struktos/adapter-express` - Express integration
- `typescript` - Type safety
- `tsx` - TypeScript execution
- `nodemon` - Auto-restart on changes

### Optional Dependencies

Based on your choices:

**Authentication:**
- `@struktos/auth` - JWT authentication
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing

**PostgreSQL:**
- `@prisma/client` - Prisma ORM
- `prisma` - Prisma CLI

**MongoDB:**
- `mongoose` - MongoDB ODM

## 🚀 Development Workflow

### 1. Create Project

```bash
struktos new my-app
cd my-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Start Development

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
npm start
```

## 📖 Examples

### Create Express App with Auth

```bash
$ struktos new auth-api

? Project name: auth-api
? Choose Framework Adapter: Express (recommended)
? Choose Persistence Layer: None (In-Memory only)
? Include Authentication (@struktos/auth)? Yes

✅ Project created successfully!

Next steps:
   cd auth-api
   npm install
   npm run dev
```

### Create Full-Stack App

```bash
$ struktos new fullstack-app

? Project name: fullstack-app
? Choose Framework Adapter: Express (recommended)
? Choose Persistence Layer: PostgreSQL (with Prisma)
? Include Authentication (@struktos/auth)? Yes

✅ Project created successfully!

Next steps:
   cd fullstack-app
   npm install
   npx prisma generate
   npm run dev
```

## 🎓 Architecture Principles

Generated projects follow these principles:

### 1. Hexagonal Architecture (Ports & Adapters)

- **Domain** - Core business logic (framework-independent)
- **Application** - Use cases and application logic
- **Infrastructure** - External adapters (HTTP, Database, etc.)

### 2. Dependency Inversion

- Domain doesn't depend on infrastructure
- Infrastructure depends on domain interfaces (ports)

### 3. Separation of Concerns

- Each layer has a clear responsibility
- No circular dependencies

### 4. Clean Code

- TypeScript for type safety
- Consistent naming conventions
- Example files to guide development

## 🔗 Related Packages

- [@struktos/core](https://www.npmjs.com/package/@struktos/core) - Context propagation
- [@struktos/adapter-express](https://www.npmjs.com/package/@struktos/adapter-express) - Express adapter
- [@struktos/auth](https://www.npmjs.com/package/@struktos/auth) - Authentication

## 📄 License

MIT © Struktos.js Team

## 🔗 Links

- [GitHub Repository](https://github.com/struktosjs/cli)
- [Issue Tracker](https://github.com/struktosjs/cli/issues)
- [NPM Package](https://www.npmjs.com/package/@struktos/cli)

---

**Built with ❤️ for enterprise Node.js development**