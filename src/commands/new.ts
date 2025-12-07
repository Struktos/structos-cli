import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { promptProjectOptions, confirmCreation } from '../utils/prompts';
import { createProjectStructure, validateTargetDirectory } from '../utils/project';
import { generatePackageJson } from '../generators/packageJson';
import { generateAppTs } from '../generators/appTs';
import {
  generateTsConfig,
  generateEnvExample,
  generateGitIgnore,
  generateReadme
} from '../generators/configFiles';

/**
 * Create new Struktos project command
 */
export function createNewCommand(): Command {
  return new Command('new')
    .argument('[project-name]', 'Name of the project to create')
    .description('Create a new Struktos.js project')
    .action(async (projectName?: string) => {
      console.log(chalk.bold.cyan('\n🚀 Struktos.js Project Generator\n'));

      try {
        // Step 1: Prompt for project options
        const options = await promptProjectOptions(projectName);

        // Step 2: Validate target directory
        const validation = await validateTargetDirectory(options.targetDirectory);
        
        if (validation.exists && !validation.isEmpty) {
          console.log(chalk.red(`\n❌ Directory "${options.name}" already exists and is not empty!`));
          console.log(chalk.yellow('   Please choose a different name or delete the existing directory.\n'));
          process.exit(1);
        }

        // Step 3: Confirm creation
        const confirmed = await confirmCreation(options);
        if (!confirmed) {
          console.log(chalk.yellow('\n⚠️  Project creation cancelled.\n'));
          process.exit(0);
        }

        // Step 4: Create project
        await createProject(options);

        // Step 5: Success message
        printSuccessMessage(options);
      } catch (error) {
        console.error(chalk.red('\n❌ Error creating project:'), error);
        process.exit(1);
      }
    });
}

/**
 * Create the project with all files and folders
 */
async function createProject(options: any): Promise<void> {
  const spinner = ora('Creating project structure...').start();

  try {
    // Create folder structure
    spinner.text = 'Creating Hexagonal Architecture folders...';
    await createProjectStructure(options);
    spinner.succeed('Created project structure');

    // Generate and write files
    spinner.start('Generating configuration files...');
    
    // package.json
    const packageJsonContent = generatePackageJson(options);
    await fs.writeFile(
      path.join(options.targetDirectory, 'package.json'),
      packageJsonContent
    );

    // tsconfig.json
    const tsConfigContent = generateTsConfig();
    await fs.writeFile(
      path.join(options.targetDirectory, 'tsconfig.json'),
      tsConfigContent
    );

    // .env.example
    const envExampleContent = generateEnvExample(options.includeAuth);
    await fs.writeFile(
      path.join(options.targetDirectory, '.env.example'),
      envExampleContent
    );

    // .gitignore
    const gitIgnoreContent = generateGitIgnore();
    await fs.writeFile(
      path.join(options.targetDirectory, '.gitignore'),
      gitIgnoreContent
    );

    // README.md
    const readmeContent = generateReadme(options.name, {
      framework: options.framework,
      persistence: options.persistence,
      includeAuth: options.includeAuth
    });
    await fs.writeFile(
      path.join(options.targetDirectory, 'README.md'),
      readmeContent
    );

    spinner.succeed('Generated configuration files');

    // Generate app.ts
    spinner.start('Generating application code...');
    const appTsContent = generateAppTs(options);
    await fs.writeFile(
      path.join(options.targetDirectory, 'src/app.ts'),
      appTsContent
    );
    spinner.succeed('Generated application code');

    // Create placeholder files
    spinner.start('Creating placeholder files...');
    await createPlaceholderFiles(options.targetDirectory);
    spinner.succeed('Created placeholder files');

  } catch (error) {
    spinner.fail('Failed to create project');
    throw error;
  }
}

/**
 * Create placeholder .gitkeep files in empty directories
 */
async function createPlaceholderFiles(targetDirectory: string): Promise<void> {
  const placeholderDirs = [
    'src/domain/entities',
    'src/domain/repositories',
    'src/domain/services',
    'src/application/use-cases',
    'src/application/ports',
    'src/infrastructure/adapters/http',
    'src/infrastructure/adapters/persistence',
    'src/common/types',
    'src/common/utils',
    'tests/unit',
    'tests/integration',
    'config'
  ];

  for (const dir of placeholderDirs) {
    await fs.writeFile(
      path.join(targetDirectory, dir, '.gitkeep'),
      ''
    );
  }

  // Create example entity
  const exampleEntity = `/**
 * Example Domain Entity
 * 
 * Domain entities represent core business concepts
 * and contain business logic
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string
  ) {}

  // Domain methods go here
  isEmailValid(): boolean {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(this.email);
  }
}
`;

  await fs.writeFile(
    path.join(targetDirectory, 'src/domain/entities/User.ts'),
    exampleEntity
  );

  // Create example repository interface
  const exampleRepository = `import { User } from '../entities/User';

/**
 * User Repository Port (Interface)
 * 
 * This is a port in Hexagonal Architecture.
 * The actual implementation will be in infrastructure/adapters
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<boolean>;
}
`;

  await fs.writeFile(
    path.join(targetDirectory, 'src/domain/repositories/IUserRepository.ts'),
    exampleRepository
  );
}

/**
 * Print success message with next steps
 */
function printSuccessMessage(options: any): void {
  console.log(chalk.green.bold('\n✅ Project created successfully!\n'));
  
  console.log(chalk.bold('📂 Project structure:'));
  console.log(`   ${options.name}/
   ├── src/
   │   ├── domain/           ${chalk.gray('# Business logic')}
   │   ├── application/      ${chalk.gray('# Use cases')}
   │   ├── infrastructure/   ${chalk.gray('# Adapters')}
   │   └── common/           ${chalk.gray('# Utilities')}
   ├── tests/
   ├── config/
   └── package.json\n`);

  console.log(chalk.bold('🎯 Next steps:\n'));
  console.log(`   ${chalk.cyan(`cd ${options.name}`)}`);
  console.log(`   ${chalk.cyan('npm install')}`);
  console.log(`   ${chalk.cyan('npm run dev')}\n`);

  if (options.includeAuth) {
    console.log(chalk.bold('🔐 Authentication endpoints:\n'));
    console.log(`   POST /auth/register - Register new user`);
    console.log(`   POST /auth/login    - Login`);
    console.log(`   GET  /api/profile   - Get profile (protected)\n`);
  }

  console.log(chalk.gray('━'.repeat(60)));
  console.log(chalk.bold.cyan('  Built with Struktos.js'));
  console.log(chalk.gray('  https://github.com/struktosjs'));
  console.log(chalk.gray('━'.repeat(60) + '\n'));
}