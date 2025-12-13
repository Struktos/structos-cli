/**
 * CLI Integration Tests
 * 
 * Tests the actual CLI commands by creating real projects and generating files.
 */

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

describe('CLI Integration', () => {
  const testDir = path.join(__dirname, '../.test-output/integration');
  const cliPath = path.join(__dirname, '../../dist/index.js');

  beforeAll(async () => {
    // Ensure CLI is built
    execSync('npm run build', { cwd: path.join(__dirname, '../..'), stdio: 'pipe' });
  });

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('CLI --help', () => {
    it('should display help information', () => {
      try {
        const result = execSync(`node ${cliPath} --help`, { encoding: 'utf-8', stdio: 'pipe' });
        expect(result).toContain('Struktos.js CLI');
        expect(result).toContain('new');
        expect(result).toContain('generate');
      } catch (error: any) {
        // Commander exits with non-zero code for --help, check stdout anyway
        const output = error.stdout?.toString() || '';
        expect(output).toContain('Struktos.js CLI');
        expect(output).toContain('new');
        expect(output).toContain('generate');
      }
    });

    it('should display version', () => {
      try {
        const result = execSync(`node ${cliPath} --version`, { encoding: 'utf-8', stdio: 'pipe' });
        expect(result).toMatch(/\d+\.\d+\.\d+/);
      } catch (error: any) {
        const output = error.stdout?.toString() || '';
        expect(output).toMatch(/\d+\.\d+\.\d+/);
      }
    });
  });

  describe('generate command help', () => {
    it('should show entity subcommand', () => {
      const result = execSync(`node ${cliPath} generate --help`, { encoding: 'utf-8' });

      expect(result).toContain('entity');
      expect(result).toContain('service');
    });

    it('should show service subcommand options', () => {
      const result = execSync(`node ${cliPath} generate service --help`, { encoding: 'utf-8' });

      expect(result).toContain('--type');
      expect(result).toContain('--methods');
    });
  });
});

describe('Project Generation Integration', () => {
  const testDir = path.join(__dirname, '../.test-output/project-gen');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('Project Structure', () => {
    it('should create Hexagonal Architecture structure', async () => {
      const { createProjectStructure } = await import('../../src/utils/project');
      
      await createProjectStructure(testDir, false);

      // Domain layer
      expect(await fs.pathExists(path.join(testDir, 'src/domain/entities'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'src/domain/repositories'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'src/domain/services'))).toBe(true);

      // Application layer
      expect(await fs.pathExists(path.join(testDir, 'src/application/use-cases'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'src/application/ports'))).toBe(true);

      // Infrastructure layer
      expect(await fs.pathExists(path.join(testDir, 'src/infrastructure/adapters/http'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'src/infrastructure/adapters/persistence'))).toBe(true);

      // Common
      expect(await fs.pathExists(path.join(testDir, 'src/common/types'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'src/common/utils'))).toBe(true);

      // Tests
      expect(await fs.pathExists(path.join(testDir, 'tests/unit'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'tests/integration'))).toBe(true);
    });

    it('should create gRPC directories when enabled', async () => {
      const { createProjectStructure } = await import('../../src/utils/project');
      
      await createProjectStructure(testDir, true);

      expect(await fs.pathExists(path.join(testDir, 'src/infrastructure/adapters/grpc'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'protos'))).toBe(true);
    });
  });
});

describe('Service Generation Integration', () => {
  const testDir = path.join(__dirname, '../.test-output/service-gen');

  beforeEach(async () => {
    // Create a mock Struktos project structure
    const { createProjectStructure, writeFile } = await import('../../src/utils/project');
    
    await createProjectStructure(testDir, true);
    await writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        dependencies: {
          '@struktos/core': '^1.0.0',
        },
      })
    );
  });

  afterEach(async () => {
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('gRPC Service Generation', () => {
    it('should generate proto file', async () => {
      const { generateProtoFile } = await import('../../src/generators/grpcGenerator');
      const { writeFile } = await import('../../src/utils/project');

      const protoContent = generateProtoFile('user', ['get', 'list', 'create', 'update', 'delete']);
      const protoPath = path.join(testDir, 'protos/user.proto');
      await writeFile(protoPath, protoContent);

      expect(await fs.pathExists(protoPath)).toBe(true);

      const content = await fs.readFile(protoPath, 'utf-8');
      expect(content).toContain('syntax = "proto3"');
      expect(content).toContain('service UserService');
      expect(content).toContain('rpc GetUser');
      expect(content).toContain('rpc ListUsers');
      expect(content).toContain('rpc CreateUser');
    });

    it('should generate service handler', async () => {
      const { generateGrpcServiceHandler } = await import('../../src/generators/grpcGenerator');
      const { writeFile } = await import('../../src/utils/project');

      const handlerContent = generateGrpcServiceHandler('user', ['get', 'list']);
      const handlerPath = path.join(testDir, 'src/infrastructure/adapters/grpc/user.service.grpc.ts');
      await writeFile(handlerPath, handlerContent);

      expect(await fs.pathExists(handlerPath)).toBe(true);

      const content = await fs.readFile(handlerPath, 'utf-8');
      expect(content).toContain('export const userService');
      expect(content).toContain('GetUser:');
      expect(content).toContain('ListUsers:');
      expect(content).toContain('RequestContext');
    });

    it('should generate registration helper', async () => {
      const { generateServiceRegistration } = await import('../../src/generators/grpcGenerator');
      const { writeFile } = await import('../../src/utils/project');

      const registrationContent = generateServiceRegistration('user');
      const registrationPath = path.join(testDir, 'src/infrastructure/adapters/grpc/user.registration.ts');
      await writeFile(registrationPath, registrationContent);

      expect(await fs.pathExists(registrationPath)).toBe(true);

      const content = await fs.readFile(registrationPath, 'utf-8');
      expect(content).toContain('registerUserService');
      expect(content).toContain('user.proto');
    });
  });
});

describe('Full Project Generation Integration', () => {
  const testDir = path.join(__dirname, '../.test-output/full-project');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  it('should generate complete Express project files', async () => {
    const { generatePackageJson, generateTsConfig } = await import('../../src/generators/packageGenerator');
    const { generateMainTs } = await import('../../src/generators/appGenerator');
    const { generateEnvExample, generateGitignore, generateReadme } = await import('../../src/generators/configGenerator');
    const { createProjectStructure, writeFile } = await import('../../src/utils/project');

    const config = {
      name: 'test-express-app',
      framework: 'express' as const,
      persistence: 'none' as const,
      useAuth: false,
      useDocker: false,
    };

    // Create structure
    await createProjectStructure(testDir, false);

    // Generate files
    await writeFile(path.join(testDir, 'package.json'), generatePackageJson(config));
    await writeFile(path.join(testDir, 'tsconfig.json'), generateTsConfig());
    await writeFile(path.join(testDir, 'src/main.ts'), generateMainTs(config));
    await writeFile(path.join(testDir, '.env.example'), generateEnvExample(config));
    await writeFile(path.join(testDir, '.gitignore'), generateGitignore());
    await writeFile(path.join(testDir, 'README.md'), generateReadme(config));

    // Verify files exist
    expect(await fs.pathExists(path.join(testDir, 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, 'tsconfig.json'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, 'src/main.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, '.env.example'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, '.gitignore'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, 'README.md'))).toBe(true);

    // Verify package.json content
    const packageJson = await fs.readJson(path.join(testDir, 'package.json'));
    expect(packageJson.name).toBe('test-express-app');
    expect(packageJson.dependencies['@struktos/core']).toBeDefined();
    expect(packageJson.dependencies['@struktos/adapter-express']).toBeDefined();
    expect(packageJson.dependencies['express']).toBeDefined();
  });

  it('should generate complete gRPC project files', async () => {
    const { generatePackageJson, generateTsConfig } = await import('../../src/generators/packageGenerator');
    const { generateMainTs } = await import('../../src/generators/appGenerator');
    const { generateEnvExample, generateReadme } = await import('../../src/generators/configGenerator');
    const { createProjectStructure, writeFile } = await import('../../src/utils/project');

    const config = {
      name: 'test-grpc-service',
      framework: 'grpc' as const,
      persistence: 'none' as const,
      useAuth: false,
      useDocker: false,
    };

    // Create structure with gRPC
    await createProjectStructure(testDir, true);

    // Generate files
    await writeFile(path.join(testDir, 'package.json'), generatePackageJson(config));
    await writeFile(path.join(testDir, 'tsconfig.json'), generateTsConfig());
    await writeFile(path.join(testDir, 'src/main.ts'), generateMainTs(config));
    await writeFile(path.join(testDir, '.env.example'), generateEnvExample(config));
    await writeFile(path.join(testDir, 'README.md'), generateReadme(config));

    // Verify gRPC-specific content
    const packageJson = await fs.readJson(path.join(testDir, 'package.json'));
    expect(packageJson.dependencies['@struktos/adapter-grpc']).toBeDefined();
    expect(packageJson.dependencies['@grpc/grpc-js']).toBeDefined();

    const mainTs = await fs.readFile(path.join(testDir, 'src/main.ts'), 'utf-8');
    expect(mainTs).toContain('createGrpcAdapter');
    expect(mainTs).toContain('GrpcContextData');
    expect(mainTs).toContain('50051');

    const envExample = await fs.readFile(path.join(testDir, '.env.example'), 'utf-8');
    expect(envExample).toContain('GRPC_PORT');

    // Verify protos directory exists
    expect(await fs.pathExists(path.join(testDir, 'protos'))).toBe(true);
  });
});