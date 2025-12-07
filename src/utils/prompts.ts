import inquirer from 'inquirer';
import { ProjectOptions, FrameworkAdapter, PersistenceLayer } from '../types';
import path from 'path';

/**
 * Prompt user for project configuration
 */
export async function promptProjectOptions(projectName?: string): Promise<ProjectOptions> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: projectName || 'my-struktos-app',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Project name is required';
        }
        if (!/^[a-z0-9-_]+$/i.test(input)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Choose Framework Adapter:',
      choices: [
        { name: 'Express (recommended)', value: 'express' },
        { name: 'Fastify (coming soon)', value: 'fastify', disabled: true },
        { name: 'Koa (coming soon)', value: 'koa', disabled: true }
      ],
      default: 'express'
    },
    {
      type: 'list',
      name: 'persistence',
      message: 'Choose Persistence Layer:',
      choices: [
        { name: 'PostgreSQL (with Prisma)', value: 'postgresql' },
        { name: 'MongoDB (with Mongoose)', value: 'mongodb' },
        { name: 'None (In-Memory only)', value: 'none' }
      ],
      default: 'none'
    },
    {
      type: 'confirm',
      name: 'includeAuth',
      message: 'Include Authentication (@struktos/auth)?',
      default: true
    }
  ]);

  const targetDirectory = path.resolve(process.cwd(), answers.name);

  return {
    name: answers.name,
    framework: answers.framework as FrameworkAdapter,
    persistence: answers.persistence as PersistenceLayer,
    includeAuth: answers.includeAuth,
    targetDirectory
  };
}

/**
 * Confirm project creation
 */
export async function confirmCreation(options: ProjectOptions): Promise<boolean> {
  console.log('\n📋 Project Configuration:');
  console.log(`   Name: ${options.name}`);
  console.log(`   Framework: ${options.framework}`);
  console.log(`   Persistence: ${options.persistence}`);
  console.log(`   Authentication: ${options.includeAuth ? 'Yes' : 'No'}`);
  console.log(`   Location: ${options.targetDirectory}\n`);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Create project with these settings?',
      default: true
    }
  ]);

  return confirm;
}