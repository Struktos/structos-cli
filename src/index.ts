#!/usr/bin/env node

import { Command } from 'commander';
import { createNewCommand } from './commands/new';
import { createGenerateCommand } from './commands/generate';

const program = new Command();

program
  .name('struktos')
  .description('Struktos.js CLI - Enterprise-grade Node.js framework')
  .version('0.1.0');

// Register commands
program.addCommand(createNewCommand());
program.addCommand(createGenerateCommand());

// Parse arguments
program.parse(process.argv);