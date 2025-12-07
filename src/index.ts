#!/usr/bin/env node

import { Command } from 'commander';
import { createNewCommand } from './commands/new';

const program = new Command();

program
  .name('struktos')
  .description('Struktos.js CLI - Enterprise-grade Node.js framework')
  .version('0.1.0');

// Register commands
program.addCommand(createNewCommand());

// Parse arguments
program.parse(process.argv);