/**
 * @struktos/cli - Package.json Generator
 */

import { ProjectConfig, ADAPTERS } from '../types';

/**
 * Generate package.json content
 */
export function generatePackageJson(config: ProjectConfig): string {
  const adapterInfo = ADAPTERS[config.framework];
  const isGrpc = config.framework === 'grpc';

  const dependencies: Record<string, string> = {
    '@struktos/core': '^1.0.0',
    [adapterInfo.package]: '^0.1.0',
  };

  // Framework-specific dependencies
  if (config.framework === 'express') {
    dependencies['express'] = '^4.21.0';
    dependencies['@types/express'] = '^5.0.0';
  } else if (config.framework === 'fastify') {
    dependencies['fastify'] = '^5.1.0';
  } else if (config.framework === 'grpc') {
    dependencies['@grpc/grpc-js'] = '^1.12.5';
    dependencies['@grpc/proto-loader'] = '^0.7.13';
  }

  // Auth dependencies
  if (config.useAuth) {
    dependencies['@struktos/auth'] = '^1.0.0';
    dependencies['jsonwebtoken'] = '^9.0.2';
    dependencies['bcryptjs'] = '^2.4.3';
  }

  // Persistence dependencies
  if (config.persistence === 'postgresql') {
    dependencies['@prisma/client'] = '^6.1.0';
  } else if (config.persistence === 'mongodb') {
    dependencies['mongoose'] = '^8.9.2';
  }

  const devDependencies: Record<string, string> = {
    '@types/node': '^20.17.9',
    'tsx': '^4.21.0',
    'typescript': '^5.7.2',
  };

  if (config.useAuth) {
    devDependencies['@types/jsonwebtoken'] = '^9.0.7';
    devDependencies['@types/bcryptjs'] = '^2.4.6';
  }

  if (config.persistence === 'postgresql') {
    devDependencies['prisma'] = '^6.1.0';
  }

  const scripts: Record<string, string> = {
    'build': 'tsc',
    'start': 'node dist/main.js',
    'dev': 'tsx watch src/main.ts',
    'lint': 'eslint src/**/*.ts',
  };

  if (config.persistence === 'postgresql') {
    scripts['db:generate'] = 'prisma generate';
    scripts['db:push'] = 'prisma db push';
    scripts['db:migrate'] = 'prisma migrate dev';
  }

  const packageJson = {
    name: config.name,
    version: '1.0.0',
    description: `${config.name} - Built with Struktos.js`,
    main: 'dist/main.js',
    scripts,
    keywords: [
      'struktos',
      config.framework,
      isGrpc ? 'microservices' : 'api',
      isGrpc ? 'grpc' : 'rest',
      'typescript',
    ],
    author: '',
    license: 'MIT',
    dependencies,
    devDependencies,
  };

  return JSON.stringify(packageJson, null, 2);
}

/**
 * Generate tsconfig.json content
 */
export function generateTsConfig(): string {
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'commonjs',
      lib: ['ES2022'],
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      outDir: './dist',
      rootDir: './src',
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      moduleResolution: 'node',
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  return JSON.stringify(tsconfig, null, 2);
}