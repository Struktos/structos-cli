#!/usr/bin/env node

/**
 * @struktos/cli v0.3.0
 * 
 * CLI tool for creating and managing Struktos.js projects
 * with HTTP and gRPC support.
 * 
 * Commands:
 *   struktos new [name]                    Create a new project
 *   struktos generate entity <n>        Generate entity with CRUD
 *   struktos generate service <n>       Generate service (HTTP/gRPC)
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createNewCommand } from './commands/new';
import { createGenerateCommand } from './commands/generate';

const VERSION = '0.3.0';

// ASCII Art Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}   ${chalk.bold.white('Struktos.js CLI')} ${chalk.gray(`v${VERSION}`)}                              ${chalk.cyan('║')}
${chalk.cyan('║')}   ${chalk.gray('Enterprise-grade Node.js Framework')}                    ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════╝')}
`;

// Create program
const program = new Command();

program
  .name('struktos')
  .description('Struktos.js CLI - Enterprise-grade Node.js framework')
  .version(VERSION, '-v, --version', 'Display version number')
  .addHelpText('beforeAll', banner);

// Register commands
program.addCommand(createNewCommand());
program.addCommand(createGenerateCommand());

// Custom help
program.on('--help', () => {
  console.log('');
  console.log(chalk.bold('Examples:'));
  console.log('');
  console.log(chalk.cyan('  # Create a new Express project'));
  console.log('  $ struktos new my-api');
  console.log('');
  console.log(chalk.cyan('  # Create a new gRPC microservice'));
  console.log('  $ struktos new my-service  # Select gRPC in prompts');
  console.log('');
  console.log(chalk.cyan('  # Generate an entity with CRUD'));
  console.log('  $ struktos generate entity Product --fields="name:string,price:number"');
  console.log('');
  console.log(chalk.cyan('  # Generate a gRPC service'));
  console.log('  $ struktos generate service user --type=grpc');
  console.log('');
  console.log(chalk.cyan('  # Generate a middleware/interceptor'));
  console.log('  $ struktos generate middleware auth');
  console.log('  $ struktos g mw logging --logging');
  console.log('');
  console.log(chalk.cyan('  # Generate a use case'));
  console.log('  $ struktos generate use-case create --entity=user');
  console.log('  $ struktos g uc delete -e product');
  console.log('');
  console.log(chalk.cyan('  # Generate a gRPC client adapter'));
  console.log('  $ struktos generate client user-service --with-port');
  console.log('');
  console.log(chalk.bold('Documentation:'));
  console.log(chalk.gray('  https://github.com/struktosjs/cli'));
  console.log('');
});

// Error handling
program.exitOverride((err) => {
  if (err.code === 'commander.help' || err.code === 'commander.helpDisplayed') {
    process.exit(0);
  }
  if (err.code === 'commander.version' || err.code === 'commander.versionDisplayed') {
    process.exit(0);
  }
  console.error(chalk.red(`Error: ${err.message}`));
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (process.argv.length === 2) {
  console.log(banner);
  program.help();
}