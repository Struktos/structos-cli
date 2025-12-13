/**
 * Project Utils Unit Tests
 */

import fs from 'fs-extra';
import path from 'path';
import {
  createProjectStructure,
  isStruktosProject,
  writeFile,
  fileExists,
  ensureDir,
} from '../../src/utils/project';

describe('project utils', () => {
  const testDir = path.join(__dirname, '../.test-output/project-utils-test');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('createProjectStructure', () => {
    it('should create basic directory structure', async () => {
      await createProjectStructure(testDir, false);

      // Check core directories
      expect(await fs.pathExists(path.join(testDir, 'src/domain/entities'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'src/domain/repositories'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'src/application/use-cases'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'src/infrastructure/adapters/http'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'src/infrastructure/adapters/persistence'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'tests'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'config'))).toBe(true);
    });

    it('should create gRPC directories when includeGrpc is true', async () => {
      await createProjectStructure(testDir, true);

      expect(await fs.pathExists(path.join(testDir, 'src/infrastructure/adapters/grpc'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'protos'))).toBe(true);
    });

    it('should not create gRPC directories when includeGrpc is false', async () => {
      await createProjectStructure(testDir, false);

      expect(await fs.pathExists(path.join(testDir, 'src/infrastructure/adapters/grpc'))).toBe(false);
      expect(await fs.pathExists(path.join(testDir, 'protos'))).toBe(false);
    });

    it('should create .gitkeep files in empty directories', async () => {
      await createProjectStructure(testDir, false);

      expect(await fs.pathExists(path.join(testDir, 'src/domain/entities/.gitkeep'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'config/.gitkeep'))).toBe(true);
    });
  });

  describe('isStruktosProject', () => {
    it('should return true for valid Struktos project', async () => {
      // Create project structure
      await createProjectStructure(testDir, false);
      
      // Create package.json with struktos dependency
      await fs.writeJson(path.join(testDir, 'package.json'), {
        name: 'test-project',
        dependencies: {
          '@struktos/core': '^1.0.0',
        },
      });

      const result = await isStruktosProject(testDir);
      expect(result).toBe(true);
    });

    it('should return false for non-Struktos project', async () => {
      // Create a basic directory
      await fs.ensureDir(path.join(testDir, 'src'));
      await fs.writeJson(path.join(testDir, 'package.json'), {
        name: 'test-project',
        dependencies: {},
      });

      const result = await isStruktosProject(testDir);
      expect(result).toBe(false);
    });

    it('should return false for empty directory', async () => {
      const result = await isStruktosProject(testDir);
      expect(result).toBe(false);
    });
  });

  describe('writeFile', () => {
    it('should write file and create parent directories', async () => {
      const filePath = path.join(testDir, 'nested/dir/file.txt');
      await writeFile(filePath, 'test content');

      expect(await fs.pathExists(filePath)).toBe(true);
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('test content');
    });

    it('should overwrite existing file', async () => {
      const filePath = path.join(testDir, 'file.txt');
      await writeFile(filePath, 'original');
      await writeFile(filePath, 'updated');

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('updated');
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const filePath = path.join(testDir, 'exists.txt');
      await fs.writeFile(filePath, 'content');

      const result = await fileExists(filePath);
      expect(result).toBe(true);
    });

    it('should return false for non-existing file', async () => {
      const result = await fileExists(path.join(testDir, 'not-exists.txt'));
      expect(result).toBe(false);
    });
  });

  describe('ensureDir', () => {
    it('should create directory if not exists', async () => {
      const dirPath = path.join(testDir, 'new-dir');
      await ensureDir(dirPath);

      expect(await fs.pathExists(dirPath)).toBe(true);
    });

    it('should not throw if directory exists', async () => {
      const dirPath = path.join(testDir, 'existing-dir');
      await fs.ensureDir(dirPath);

      await expect(ensureDir(dirPath)).resolves.not.toThrow();
    });
  });
});