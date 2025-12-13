/**
 * Jest Setup
 */

import fs from 'fs-extra';
import path from 'path';

// Test directories
export const TEST_DIR = path.join(__dirname, '.test-output');
export const TEST_PROJECT_DIR = path.join(TEST_DIR, 'test-project');

// Setup before all tests
beforeAll(async () => {
  // Clean up any leftover test directories
  if (await fs.pathExists(TEST_DIR)) {
    await fs.remove(TEST_DIR);
  }
  // Ensure test directory exists
  await fs.ensureDir(TEST_DIR);
});

// Cleanup after all tests
afterAll(async () => {
  // Clean up test directory
  if (await fs.pathExists(TEST_DIR)) {
    await fs.remove(TEST_DIR);
  }
});

// Suppress console output during tests (optional)
// Uncomment to silence console during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };