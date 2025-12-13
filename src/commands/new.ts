/**
 * @struktos/cli - New Command
 * 
 * Creates a new Struktos.js project with the selected configuration.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { promptProjectConfig } from '../utils/prompts';
import { createProjectStructure } from '../utils/project';
import {
  generatePackageJson,
  generateTsConfig,
  generateMainTs,
  generateEnvExample,
  generateGitignore,
  generateDockerfile,
  generateDockerCompose,
  generateReadme,
  generateMetadataConfig,
} from '../generators';
import { ADAPTERS } from '../types';

/**
 * Create the 'new' command
 */
export function createNewCommand(): Command {
  return new Command('new')
    .argument('[name]', 'Project name')
    .description('Create a new Struktos.js project')
    .action(async (name?: string) => {
      try {
        await createProject(name);
      } catch (error) {
        console.error(chalk.red('\n❌ Error creating project:'), error);
        process.exit(1);
      }
    });
}

/**
 * Create a new project
 */
async function createProject(defaultName?: string): Promise<void> {
  console.log(chalk.bold.cyan('\n🚀 Struktos.js - New Project\n'));

  // Get project configuration
  const config = await promptProjectConfig(defaultName);
  const projectPath = path.resolve(config.name);
  const adapterInfo = ADAPTERS[config.framework];
  const isGrpc = config.framework === 'grpc';

  // Check if directory exists
  if (await fs.pathExists(projectPath)) {
    console.log(chalk.red(`\n❌ Directory "${config.name}" already exists!\n`));
    process.exit(1);
  }

  console.log();
  console.log(chalk.bold('📋 Project Configuration:'));
  console.log(`   Name: ${chalk.cyan(config.name)}`);
  console.log(`   Framework: ${chalk.cyan(adapterInfo.name)}`);
  console.log(`   Protocol: ${chalk.cyan(isGrpc ? 'gRPC' : 'HTTP')}`);
  console.log(`   Persistence: ${chalk.cyan(config.persistence)}`);
  console.log(`   Auth: ${chalk.cyan(config.useAuth ? 'Yes' : 'No')}`);
  console.log(`   Docker: ${chalk.cyan(config.useDocker ? 'Yes' : 'No')}`);
  console.log();

  const spinner = ora('Creating project structure...').start();

  try {
    // Create project directory
    await fs.ensureDir(projectPath);

    // Create directory structure
    spinner.text = 'Creating directory structure...';
    await createProjectStructure(projectPath, isGrpc);
    spinner.succeed('Created directory structure');

    // Generate package.json
    spinner.start('Generating package.json...');
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      generatePackageJson(config)
    );
    spinner.succeed('Generated package.json');

    // Generate tsconfig.json
    spinner.start('Generating tsconfig.json...');
    await fs.writeFile(
      path.join(projectPath, 'tsconfig.json'),
      generateTsConfig()
    );
    spinner.succeed('Generated tsconfig.json');

    // Generate main.ts
    spinner.start('Generating main.ts...');
    await fs.writeFile(
      path.join(projectPath, 'src/main.ts'),
      generateMainTs(config)
    );
    spinner.succeed('Generated main.ts');

    // Generate .env.example
    spinner.start('Generating .env.example...');
    await fs.writeFile(
      path.join(projectPath, '.env.example'),
      generateEnvExample(config)
    );
    await fs.copy(
      path.join(projectPath, '.env.example'),
      path.join(projectPath, '.env')
    );
    spinner.succeed('Generated environment files');

    // Generate struktos.metadata.json
    spinner.start('Generating struktos.metadata.json...');
    await fs.ensureDir(path.join(projectPath, 'config'));
    await fs.writeFile(
      path.join(projectPath, 'config/struktos.metadata.json'),
      generateMetadataConfig(config)
    );
    spinner.succeed('Generated metadata configuration');

    // Generate .gitignore
    spinner.start('Generating .gitignore...');
    await fs.writeFile(
      path.join(projectPath, '.gitignore'),
      generateGitignore()
    );
    spinner.succeed('Generated .gitignore');

    // Generate Docker files if requested
    if (config.useDocker) {
      spinner.start('Generating Docker configuration...');
      await fs.writeFile(
        path.join(projectPath, 'Dockerfile'),
        generateDockerfile(config)
      );
      await fs.writeFile(
        path.join(projectPath, 'docker-compose.yml'),
        generateDockerCompose(config)
      );
      spinner.succeed('Generated Docker configuration');
    }

    // Generate README
    spinner.start('Generating README.md...');
    await fs.writeFile(
      path.join(projectPath, 'README.md'),
      generateReadme(config)
    );
    spinner.succeed('Generated README.md');

    // Generate example proto file for gRPC
    if (isGrpc) {
      spinner.start('Generating example proto file...');
      await fs.writeFile(
        path.join(projectPath, 'protos/health.proto'),
        generateExampleProto()
      );
      spinner.succeed('Generated example proto file');
    }

    // Success message
    console.log();
    console.log(chalk.green.bold('✅ Project created successfully!'));
    console.log();
    console.log(chalk.bold('📁 Next steps:'));
    console.log();
    console.log(chalk.cyan(`   cd ${config.name}`));
    console.log(chalk.cyan('   npm install'));
    console.log(chalk.cyan('   npm run dev'));
    console.log();

    if (isGrpc) {
      console.log(chalk.bold('📡 gRPC server will start at:'));
      console.log(chalk.cyan(`   grpc://localhost:${adapterInfo.defaultPort}`));
      console.log();
      console.log(chalk.bold('🔧 Generate a new service:'));
      console.log(chalk.cyan('   struktos generate service user --type=grpc'));
    } else {
      console.log(chalk.bold('🌐 HTTP server will start at:'));
      console.log(chalk.cyan(`   http://localhost:${adapterInfo.defaultPort}`));
      console.log();
      console.log(chalk.bold('🔧 Generate a new entity:'));
      console.log(chalk.cyan('   struktos generate entity Product --fields="name:string,price:number"'));
    }
    console.log();

  } catch (error) {
    spinner.fail('Failed to create project');
    // Clean up on error
    if (await fs.pathExists(projectPath)) {
      await fs.remove(projectPath);
    }
    throw error;
  }
}

/**
 * Generate example health proto file
 */
function generateExampleProto(): string {
  return `syntax = "proto3";

package grpc.health.v1;

// Health check service
service Health {
  // Check health status
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
  
  // Watch health status changes (streaming)
  rpc Watch(HealthCheckRequest) returns (stream HealthCheckResponse);
}

message HealthCheckRequest {
  string service = 1;
}

message HealthCheckResponse {
  enum ServingStatus {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
    SERVICE_UNKNOWN = 3;
  }
  ServingStatus status = 1;
}
`;
}