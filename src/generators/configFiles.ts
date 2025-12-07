/**
 * Generate tsconfig.json content
 */
export function generateTsConfig(): string {
  const config = {
    compilerOptions: {
      target: 'ES2022',
      module: 'commonjs',
      lib: ['ES2022'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      moduleResolution: 'node',
      declaration: true,
      declarationMap: true,
      sourceMap: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', 'tests']
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Generate .env.example content
 */
export function generateEnvExample(includeAuth: boolean): string {
  let content = `# Server Configuration
PORT=3000
NODE_ENV=development

# Struktos Configuration
LOG_LEVEL=info
`;

  if (includeAuth) {
    content += `
# Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
`;
  }

  return content;
}

/**
 * Generate .gitignore content
 */
export function generateGitIgnore(): string {
  return `# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Misc
*.tsbuildinfo
.cache/
`;
}

/**
 * Generate README.md content
 */
export function generateReadme(projectName: string, options: {
  framework: string;
  persistence: string;
  includeAuth: boolean;
}): string {
  const { framework, persistence, includeAuth } = options;

  return `# ${projectName}

> Built with [Struktos.js](https://github.com/struktosjs) - Enterprise-grade Node.js framework

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 📦 Stack

- **Framework**: ${framework === 'express' ? 'Express.js' : framework}
- **Architecture**: Hexagonal (Ports & Adapters)
- **Context Propagation**: @struktos/core
${includeAuth ? '- **Authentication**: @struktos/auth (JWT-based)' : ''}
${persistence !== 'none' ? `- **Database**: ${persistence}` : '- **Database**: In-Memory (development only)'}

## 🏗️ Architecture

This project follows Hexagonal Architecture principles:

\`\`\`
src/
├── domain/           # Business logic and entities
│   ├── entities/     # Domain models
│   ├── repositories/ # Repository interfaces (ports)
│   └── services/     # Domain services
├── application/      # Application logic
│   ├── use-cases/    # Application use cases
│   └── ports/        # Application ports
├── infrastructure/   # External adapters
│   └── adapters/
│       ├── http/     # HTTP controllers (${framework})
│       └── persistence/ # Database implementations
└── common/           # Shared utilities
    ├── types/        # Shared types
    └── utils/        # Utility functions
\`\`\`

## 🔑 Environment Variables

Copy \`.env.example\` to \`.env\` and configure:

\`\`\`bash
cp .env.example .env
\`\`\`

${includeAuth ? `
## 🔐 Authentication

This project includes @struktos/auth for JWT-based authentication.

### Endpoints

- \`POST /auth/register\` - Register new user
- \`POST /auth/login\` - Login
- \`GET /api/profile\` - Get user profile (protected)

### Example

\`\`\`bash
# Register
curl -X POST http://localhost:3000/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"john","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"john","password":"password123"}'

# Get profile (use token from login)
curl http://localhost:3000/api/profile \\
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`
` : ''}

## 📚 Documentation

- [Struktos Core](https://github.com/struktosjs/core)
- [Struktos Express Adapter](https://github.com/struktosjs/adapter-express)
${includeAuth ? '- [Struktos Auth](https://github.com/struktosjs/auth)' : ''}

## 📄 License

MIT
`;
}