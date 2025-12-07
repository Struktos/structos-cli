import { ProjectOptions } from '../types';

/**
 * Generate main app.ts file
 */
export function generateAppTs(options: ProjectOptions): string {
  const { framework, includeAuth } = options;

  if (framework === 'express') {
    return generateExpressApp(includeAuth);
  }

  // Fallback for other frameworks
  return generateGenericApp(framework, includeAuth);
}

/**
 * Generate Express application
 */
function generateExpressApp(includeAuth: boolean): string {
  const authImports = includeAuth
    ? `import { AuthService, InMemoryAuthStore, createAuthenticateMiddleware } from '@struktos/auth';`
    : '';

  const authSetup = includeAuth
    ? `
// Initialize Auth Store and Service
const authStore = new InMemoryAuthStore();
const authService = new AuthService(authStore, {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: '1h',
  enableTokenCache: true,
  enableClaimsCache: true
});

// Authentication middleware
const authenticate = createAuthenticateMiddleware(authService);
`
    : '';

  const authRoutes = includeAuth
    ? `
// Authentication routes
app.post('/auth/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    if (result.success) {
      res.json({
        accessToken: result.accessToken,
        user: result.user
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const result = await authService.login(req.body);
    if (result.success) {
      res.json({
        accessToken: result.accessToken,
        user: result.user
      });
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected route example
app.get('/api/profile', authenticate, (req, res) => {
  res.json({ user: (req as any).user });
});
`
    : '';

  return `import express from 'express';
import { createStruktosMiddleware, RequestContext } from '@struktos/adapter-express';
${authImports}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Struktos Context middleware
app.use(createStruktosMiddleware({
  generateTraceId: () => \`trace-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
  onCancel: (req, traceId) => {
    console.log(\`Request cancelled - TraceID: \${traceId}\`);
  }
}));
${authSetup}
// Routes
app.get('/', (req, res) => {
  const ctx = RequestContext.current();
  const traceId = ctx?.get('traceId');
  
  res.json({
    message: 'Welcome to Struktos.js!',
    traceId,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});
${authRoutes}
// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(\`  \${process.env.npm_package_name || 'Struktos App'}\`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(\`\\n🚀 Server running at http://localhost:\${PORT}\`);
  console.log('\\n📋 Available endpoints:');
  console.log('   GET  /              - Welcome message');
  console.log('   GET  /health        - Health check');
  ${includeAuth ? `console.log('   POST /auth/register - Register new user');
  console.log('   POST /auth/login    - Login');
  console.log('   GET  /api/profile   - Get profile (protected)');` : ''}
  console.log('═══════════════════════════════════════════════════════════\\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\\n🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
`;
}

/**
 * Generate generic application for other frameworks
 */
function generateGenericApp(framework: string, includeAuth: boolean): string {
  return `// ${framework} application
// TODO: Implement ${framework} adapter

console.log('Welcome to Struktos.js with ${framework}!');
console.log('This framework adapter is coming soon.');
${includeAuth ? `console.log('Authentication will be integrated when the adapter is ready.');` : ''}
`;
}