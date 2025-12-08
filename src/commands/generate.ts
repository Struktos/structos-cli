import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { parseFields, validateEntityName, toPascalCase, toKebabCase } from '../utils/fieldParser';
import {
  generateEntityFile,
  generateRepositoryInterface,
  generateRepositoryImplementation
} from '../generators/entityGenerator';
import {
  generateCreateUseCase,
  generateGetUseCase,
  generateListUseCase,
  generateUpdateUseCase,
  generateDeleteUseCase
} from '../generators/useCaseGenerator';

/**
 * Create generate command
 */
export function createGenerateCommand(): Command {
  const generate = new Command('generate')
    .alias('g')
    .description('Generate code based on templates');

  // Entity subcommand
  generate
    .command('entity')
    .argument('<name>', 'Name of the entity to generate')
    .option('-f, --fields <fields>', 'Field definitions (e.g., "name:string,age:number")')
    .description('Generate a complete entity with repository and use cases')
    .action(async (name: string, options: { fields?: string }) => {
      try {
        await generateEntity(name, options.fields);
      } catch (error) {
        console.error(chalk.red('\n❌ Error generating entity:'), error);
        process.exit(1);
      }
    });

  return generate;
}

/**
 * Generate entity files
 */
async function generateEntity(entityName: string, fieldsInput?: string): Promise<void> {
  console.log(chalk.bold.cyan('\n🔧 Struktos Code Generator - Entity\n'));

  // Validate entity name
  validateEntityName(entityName);

  // Parse fields
  let fields = fieldsInput ? parseFields(fieldsInput) : [];
  
  // Ensure id field exists
  const hasIdField = fields.some(f => f.name.toLowerCase() === 'id');
  if (!hasIdField) {
    fields = [{ name: 'id', type: 'string', optional: false }, ...fields];
  }

  // Display generation plan
  const className = toPascalCase(entityName);
  console.log(chalk.bold('📋 Generation Plan:'));
  console.log(`   Entity: ${chalk.cyan(className)}`);
  console.log(`   Fields: ${fields.length}`);
  fields.forEach(f => {
    console.log(`      - ${f.name}: ${f.type}${f.optional ? '?' : ''}`);
  });
  console.log();

  // Check if we're in a Struktos project
  const isStruktosProject = await validateProjectStructure();
  if (!isStruktosProject) {
    console.log(chalk.red('❌ Not a Struktos project!'));
    console.log(chalk.yellow('   Run this command in a project created with "struktos new"\n'));
    process.exit(1);
  }

  const spinner = ora('Generating files...').start();

  try {
    // Generate Domain Layer
    spinner.text = 'Generating domain entity...';
    await generateDomainLayer(entityName, fields);
    spinner.succeed('Generated domain layer');

    // Generate Repository Interface
    spinner.start('Generating repository interface...');
    await generateRepositoryLayer(entityName, fields);
    spinner.succeed('Generated repository layer');

    // Generate Use Cases
    spinner.start('Generating use cases...');
    await generateApplicationLayer(entityName, fields);
    spinner.succeed('Generated application layer');

    // Success message
    printSuccessMessage(entityName, fields);
  } catch (error) {
    spinner.fail('Failed to generate entity');
    throw error;
  }
}

/**
 * Validate project structure
 */
async function validateProjectStructure(): Promise<boolean> {
  const requiredDirs = [
    'src/domain/entities',
    'src/domain/repositories',
    'src/application/use-cases',
    'src/infrastructure/adapters/persistence'
  ];

  for (const dir of requiredDirs) {
    const exists = await fs.pathExists(dir);
    if (!exists) {
      return false;
    }
  }

  return true;
}

/**
 * Generate domain layer files
 */
async function generateDomainLayer(entityName: string, fields: any[]): Promise<void> {
  const className = toPascalCase(entityName);
  const entityContent = generateEntityFile(entityName, fields);

  await fs.writeFile(
    path.join('src/domain/entities', `${className}.entity.ts`),
    entityContent
  );
}

/**
 * Generate repository layer files
 */
async function generateRepositoryLayer(entityName: string, fields: any[]): Promise<void> {
  const className = toPascalCase(entityName);

  // Repository interface
  const interfaceContent = generateRepositoryInterface(entityName, fields);
  await fs.writeFile(
    path.join('src/domain/repositories', `I${className}Repository.ts`),
    interfaceContent
  );

  // Repository implementation
  const implContent = generateRepositoryImplementation(entityName, fields);
  await fs.writeFile(
    path.join('src/infrastructure/adapters/persistence', `${className}.repository.ts`),
    implContent
  );
}

/**
 * Generate application layer files
 */
async function generateApplicationLayer(entityName: string, fields: any[]): Promise<void> {
  const className = toPascalCase(entityName);
  const kebabName = toKebabCase(entityName);

  // Create use case
  const createContent = generateCreateUseCase(entityName, fields);
  await fs.writeFile(
    path.join('src/application/use-cases', `create-${kebabName}.usecase.ts`),
    createContent
  );

  // Get use case
  const getContent = generateGetUseCase(entityName, fields);
  await fs.writeFile(
    path.join('src/application/use-cases', `get-${kebabName}.usecase.ts`),
    getContent
  );

  // List use case
  const listContent = generateListUseCase(entityName, fields);
  await fs.writeFile(
    path.join('src/application/use-cases', `list-${kebabName}s.usecase.ts`),
    listContent
  );

  // Update use case
  const updateContent = generateUpdateUseCase(entityName, fields);
  await fs.writeFile(
    path.join('src/application/use-cases', `update-${kebabName}.usecase.ts`),
    updateContent
  );

  // Delete use case
  const deleteContent = generateDeleteUseCase(entityName, fields);
  await fs.writeFile(
    path.join('src/application/use-cases', `delete-${kebabName}.usecase.ts`),
    deleteContent
  );
}

/**
 * Print success message
 */
function printSuccessMessage(entityName: string, fields: any[]): void {
  const className = toPascalCase(entityName);
  const kebabName = toKebabCase(entityName);

  console.log(chalk.green.bold('\n✅ Entity generated successfully!\n'));

  console.log(chalk.bold('📁 Generated files:\n'));

  console.log(chalk.cyan('Domain Layer:'));
  console.log(`   ${chalk.white('src/domain/entities/')}${className}.entity.ts`);
  console.log(`   ${chalk.white('src/domain/repositories/')}I${className}Repository.ts\n`);

  console.log(chalk.cyan('Application Layer:'));
  console.log(`   ${chalk.white('src/application/use-cases/')}create-${kebabName}.usecase.ts`);
  console.log(`   ${chalk.white('src/application/use-cases/')}get-${kebabName}.usecase.ts`);
  console.log(`   ${chalk.white('src/application/use-cases/')}list-${kebabName}s.usecase.ts`);
  console.log(`   ${chalk.white('src/application/use-cases/')}update-${kebabName}.usecase.ts`);
  console.log(`   ${chalk.white('src/application/use-cases/')}delete-${kebabName}.usecase.ts\n`);

  console.log(chalk.cyan('Infrastructure Layer:'));
  console.log(`   ${chalk.white('src/infrastructure/adapters/persistence/')}${className}.repository.ts\n`);

  console.log(chalk.bold('🎯 Next steps:\n'));
  console.log(`   1. Review generated files`);
  console.log(`   2. Customize business logic in ${className}.entity.ts`);
  console.log(`   3. Add validation rules in use cases`);
  console.log(`   4. Integrate with your HTTP controllers\n`);

  console.log(chalk.gray('━'.repeat(60)));
  console.log(chalk.bold.cyan('  Built with Struktos.js'));
  console.log(chalk.gray('━'.repeat(60) + '\n'));
}