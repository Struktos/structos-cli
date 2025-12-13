/**
 * @struktos/cli - Generate Command
 * 
 * Generate various project components including entities, services,
 * middleware/interceptors, use cases, and gRPC clients.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import {
  parseFields,
  validateEntityName,
  toPascalCase,
  toCamelCase,
  toKebabCase,
} from '../utils/fieldParser';
import { promptServiceType, promptGrpcMethods } from '../utils/prompts';
import { isStruktosProject, writeFile } from '../utils/project';
import {
  generateProtoFile,
  generateGrpcServiceHandler,
  generateServiceRegistration,
} from '../generators/grpcGenerator';
import {
  generateMiddleware,
  generateLoggingMiddleware,
  generateTimingMiddleware,
} from '../generators/middlewareGenerator';
import { generateUseCase } from '../generators/useCaseGenerator';
import {
  generateGrpcClientAdapter,
  generateClientPortInterface,
} from '../generators/clientGenerator';
import { FieldDefinition, ServiceType } from '../types';

/**
 * Create the 'generate' command
 */
export function createGenerateCommand(): Command {
  const generate = new Command('generate')
    .alias('g')
    .description('Generate code components');

  // Entity subcommand (existing)
  generate
    .command('entity')
    .argument('<name>', 'Name of the entity')
    .option('-f, --fields <fields>', 'Field definitions (e.g., "name:string,price:number")')
    .description('Generate a complete entity with repository and use cases')
    .action(async (name: string, options: { fields?: string }) => {
      try {
        await generateEntity(name, options.fields);
      } catch (error) {
        console.error(chalk.red('\n❌ Error generating entity:'), error);
        process.exit(1);
      }
    });

  // Service subcommand (new)
  generate
    .command('service')
    .argument('<name>', 'Name of the service')
    .option('-t, --type <type>', 'Service type (http or grpc)', 'grpc')
    .option('-m, --methods <methods>', 'Methods to generate (comma-separated: get,list,create,update,delete)')
    .description('Generate a service with handlers')
    .action(async (name: string, options: { type?: string; methods?: string }) => {
      try {
        await generateService(name, options.type as ServiceType, options.methods);
      } catch (error) {
        console.error(chalk.red('\n❌ Error generating service:'), error);
        process.exit(1);
      }
    });

  // Middleware/Interceptor subcommand (NEW v0.3.0)
  generate
    .command('middleware')
    .alias('mw')
    .argument('<n>', 'Name of the middleware/interceptor')
    .option('--logging', 'Generate a logging interceptor template')
    .option('--timing', 'Generate a timing interceptor template')
    .description('Generate a middleware/interceptor class')
    .action(async (name: string, options: { logging?: boolean; timing?: boolean }) => {
      try {
        await generateMiddlewareFile(name, options);
      } catch (error) {
        console.error(chalk.red('\n❌ Error generating middleware:'), error);
        process.exit(1);
      }
    });

  // Use Case subcommand (NEW v0.3.0)
  generate
    .command('use-case')
    .alias('uc')
    .argument('<action>', 'Action name (e.g., create, get, list, update, delete)')
    .requiredOption('-e, --entity <entity>', 'Entity name for the use case')
    .option('--no-repository', 'Skip repository injection')
    .option('--no-logger', 'Skip logger injection')
    .option('--no-validation', 'Skip validation logic')
    .description('Generate a use case class')
    .action(async (action: string, options: { entity: string; repository?: boolean; logger?: boolean; validation?: boolean }) => {
      try {
        await generateUseCaseFile(action, options.entity, {
          withRepository: options.repository !== false,
          withLogger: options.logger !== false,
          withValidation: options.validation !== false,
        });
      } catch (error) {
        console.error(chalk.red('\n❌ Error generating use case:'), error);
        process.exit(1);
      }
    });

  // gRPC Client subcommand (NEW v0.3.0)
  generate
    .command('client')
    .argument('<service>', 'Name of the remote service')
    .option('--with-port', 'Also generate the port interface')
    .description('Generate a gRPC client adapter')
    .action(async (service: string, options: { withPort?: boolean }) => {
      try {
        await generateClientFile(service, options.withPort);
      } catch (error) {
        console.error(chalk.red('\n❌ Error generating client:'), error);
        process.exit(1);
      }
    });

  return generate;
}

/**
 * Generate entity files (existing functionality)
 */
async function generateEntity(entityName: string, fieldsInput?: string): Promise<void> {
  console.log(chalk.bold.cyan('\n🔧 Struktos Code Generator - Entity\n'));

  // Validate
  validateEntityName(entityName);

  // Check if in Struktos project
  if (!(await isStruktosProject())) {
    console.log(chalk.red('❌ Not a Struktos project!'));
    console.log(chalk.yellow('   Run this command in a project created with "struktos new"\n'));
    process.exit(1);
  }

  // Parse fields
  let fields = fieldsInput ? parseFields(fieldsInput) : [];
  const hasIdField = fields.some((f) => f.name.toLowerCase() === 'id');
  if (!hasIdField) {
    fields = [{ name: 'id', type: 'string', optional: false }, ...fields];
  }

  const className = toPascalCase(entityName);
  const kebabName = toKebabCase(entityName);

  console.log(chalk.bold('📋 Generation Plan:'));
  console.log(`   Entity: ${chalk.cyan(className)}`);
  console.log(`   Fields: ${fields.length}`);
  fields.forEach((f) => {
    console.log(`      - ${f.name}: ${f.type}${f.optional ? '?' : ''}`);
  });
  console.log();

  const spinner = ora('Generating entity files...').start();

  try {
    // Generate domain entity
    spinner.text = 'Generating domain entity...';
    await writeFile(
      path.join('src/domain/entities', `${className}.entity.ts`),
      generateEntityFile(className, fields)
    );

    // Generate repository interface
    spinner.text = 'Generating repository interface...';
    await writeFile(
      path.join('src/domain/repositories', `I${className}Repository.ts`),
      generateRepositoryInterface(className)
    );

    // Generate repository implementation
    spinner.text = 'Generating repository implementation...';
    await writeFile(
      path.join('src/infrastructure/adapters/persistence', `${className}.repository.ts`),
      generateRepositoryImplementation(className)
    );

    spinner.succeed('Generated entity files');

    console.log();
    console.log(chalk.green.bold('✅ Entity generated successfully!'));
    console.log();
    console.log(chalk.bold('📁 Generated files:'));
    console.log(chalk.gray(`   src/domain/entities/${className}.entity.ts`));
    console.log(chalk.gray(`   src/domain/repositories/I${className}Repository.ts`));
    console.log(chalk.gray(`   src/infrastructure/adapters/persistence/${className}.repository.ts`));
    console.log();

  } catch (error) {
    spinner.fail('Failed to generate entity');
    throw error;
  }
}

/**
 * Generate service files (new functionality)
 */
async function generateService(
  serviceName: string,
  serviceType?: ServiceType,
  methodsInput?: string
): Promise<void> {
  console.log(chalk.bold.cyan('\n🔧 Struktos Code Generator - Service\n'));

  // Validate
  validateEntityName(serviceName);

  // Check if in Struktos project
  if (!(await isStruktosProject())) {
    console.log(chalk.red('❌ Not a Struktos project!'));
    console.log(chalk.yellow('   Run this command in a project created with "struktos new"\n'));
    process.exit(1);
  }

  // Determine service type
  const type = serviceType || (await promptServiceType());

  // Parse or prompt for methods
  let methods: string[];
  if (methodsInput) {
    methods = methodsInput.split(',').map((m) => m.trim().toLowerCase());
  } else if (type === 'grpc') {
    methods = await promptGrpcMethods(serviceName);
  } else {
    methods = ['get', 'list', 'create', 'update', 'delete'];
  }

  const className = toPascalCase(serviceName);
  const kebabName = toKebabCase(serviceName);

  console.log();
  console.log(chalk.bold('📋 Generation Plan:'));
  console.log(`   Service: ${chalk.cyan(className)}`);
  console.log(`   Type: ${chalk.cyan(type)}`);
  console.log(`   Methods: ${chalk.cyan(methods.join(', '))}`);
  console.log();

  if (type === 'grpc') {
    await generateGrpcService(serviceName, methods);
  } else {
    await generateHttpService(serviceName, methods);
  }
}

/**
 * Generate gRPC service files
 */
async function generateGrpcService(serviceName: string, methods: string[]): Promise<void> {
  const className = toPascalCase(serviceName);
  const kebabName = toKebabCase(serviceName);

  const spinner = ora('Generating gRPC service files...').start();

  try {
    // Ensure directories exist
    await fs.ensureDir('protos');
    await fs.ensureDir('src/infrastructure/adapters/grpc');

    // Generate .proto file
    spinner.text = 'Generating .proto file...';
    const protoContent = generateProtoFile(serviceName, methods);
    await writeFile(
      path.join('protos', `${kebabName}.proto`),
      protoContent
    );
    spinner.succeed('Generated .proto file');

    // Generate service handler
    spinner.start('Generating service handler...');
    const handlerContent = generateGrpcServiceHandler(serviceName, methods);
    await writeFile(
      path.join('src/infrastructure/adapters/grpc', `${kebabName}.service.grpc.ts`),
      handlerContent
    );
    spinner.succeed('Generated service handler');

    // Generate registration example
    spinner.start('Generating registration example...');
    const registrationContent = generateServiceRegistration(serviceName);
    await writeFile(
      path.join('src/infrastructure/adapters/grpc', `${kebabName}.registration.ts`),
      registrationContent
    );
    spinner.succeed('Generated registration example');

    // Success message
    console.log();
    console.log(chalk.green.bold('✅ gRPC Service generated successfully!'));
    console.log();
    console.log(chalk.bold('📁 Generated files:'));
    console.log(chalk.gray(`   protos/${kebabName}.proto`));
    console.log(chalk.gray(`   src/infrastructure/adapters/grpc/${kebabName}.service.grpc.ts`));
    console.log(chalk.gray(`   src/infrastructure/adapters/grpc/${kebabName}.registration.ts`));
    console.log();
    console.log(chalk.bold('📝 Next steps:'));
    console.log();
    console.log(chalk.yellow('   1. Add to your main.ts:'));
    console.log(chalk.cyan(`      import { register${className}Service } from './infrastructure/adapters/grpc/${kebabName}.service.grpc';`));
    console.log();
    console.log(chalk.yellow('   2. Register the service:'));
    console.log(chalk.cyan(`      await register${className}Service(adapter, './protos/${kebabName}.proto');`));
    console.log();
    console.log(chalk.yellow('   3. Implement business logic in the handler file'));
    console.log();

  } catch (error) {
    spinner.fail('Failed to generate gRPC service');
    throw error;
  }
}

/**
 * Generate HTTP service files
 */
async function generateHttpService(serviceName: string, methods: string[]): Promise<void> {
  const className = toPascalCase(serviceName);
  const kebabName = toKebabCase(serviceName);

  const spinner = ora('Generating HTTP service files...').start();

  try {
    // Ensure directory exists
    await fs.ensureDir('src/infrastructure/adapters/http');

    // Generate controller
    spinner.text = 'Generating controller...';
    const controllerContent = generateHttpController(serviceName, methods);
    await writeFile(
      path.join('src/infrastructure/adapters/http', `${kebabName}.controller.ts`),
      controllerContent
    );
    spinner.succeed('Generated controller');

    // Success message
    console.log();
    console.log(chalk.green.bold('✅ HTTP Service generated successfully!'));
    console.log();
    console.log(chalk.bold('📁 Generated files:'));
    console.log(chalk.gray(`   src/infrastructure/adapters/http/${kebabName}.controller.ts`));
    console.log();
    console.log(chalk.bold('📝 Next steps:'));
    console.log();
    console.log(chalk.yellow('   1. Import and register routes in your main.ts'));
    console.log(chalk.yellow('   2. Implement business logic using use cases'));
    console.log();

  } catch (error) {
    spinner.fail('Failed to generate HTTP service');
    throw error;
  }
}

// ==================== Helper Generators ====================

function generateEntityFile(className: string, fields: FieldDefinition[]): string {
  const constructorParams = fields
    .map((f) => `    public readonly ${f.name}${f.optional ? '?' : ''}: ${f.type},`)
    .join('\n');

  return `/**
 * ${className} Entity
 * Generated by @struktos/cli
 */

export class ${className} {
  constructor(
${constructorParams}
  ) {}

  toObject(): Record<string, unknown> {
    return {
      ${fields.map((f) => f.name).join(',\n      ')},
    };
  }

  static fromObject(data: Record<string, unknown>): ${className} {
    return new ${className}(
      ${fields.map((f) => `data.${f.name} as ${f.type}`).join(',\n      ')},
    );
  }
}
`;
}

function generateRepositoryInterface(className: string): string {
  return `/**
 * I${className}Repository Interface
 * Generated by @struktos/cli
 */

import { ${className} } from '../entities/${className}.entity';

export interface I${className}Repository {
  findById(id: string): Promise<${className} | null>;
  findAll(): Promise<${className}[]>;
  create(entity: ${className}): Promise<${className}>;
  update(entity: ${className}): Promise<${className}>;
  delete(id: string): Promise<boolean>;
}
`;
}

function generateRepositoryImplementation(className: string): string {
  const camelName = className.charAt(0).toLowerCase() + className.slice(1);

  return `/**
 * ${className} Repository Implementation (In-Memory)
 * Generated by @struktos/cli
 */

import { ${className} } from '../../../domain/entities/${className}.entity';
import { I${className}Repository } from '../../../domain/repositories/I${className}Repository';

export class ${className}Repository implements I${className}Repository {
  private ${camelName}s: Map<string, ${className}> = new Map();

  async findById(id: string): Promise<${className} | null> {
    return this.${camelName}s.get(id) || null;
  }

  async findAll(): Promise<${className}[]> {
    return Array.from(this.${camelName}s.values());
  }

  async create(entity: ${className}): Promise<${className}> {
    this.${camelName}s.set(entity.id, entity);
    return entity;
  }

  async update(entity: ${className}): Promise<${className}> {
    this.${camelName}s.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<boolean> {
    return this.${camelName}s.delete(id);
  }
}
`;
}

function generateHttpController(serviceName: string, methods: string[]): string {
  const className = toPascalCase(serviceName);
  const camelName = serviceName.charAt(0).toLowerCase() + serviceName.slice(1);
  const pluralCamel = camelName + 's';

  const methodImplementations = methods.map((method) => {
    switch (method) {
      case 'get':
        return `  /**
   * GET /${pluralCamel}/:id
   */
  async get${className}(req: any, res: any): Promise<void> {
    const { id } = req.params;
    // TODO: Implement using use case
    res.json({ id, message: 'Get ${className}' });
  }`;
      case 'list':
        return `  /**
   * GET /${pluralCamel}
   */
  async list${className}s(req: any, res: any): Promise<void> {
    // TODO: Implement using use case
    res.json({ message: 'List ${className}s', data: [] });
  }`;
      case 'create':
        return `  /**
   * POST /${pluralCamel}
   */
  async create${className}(req: any, res: any): Promise<void> {
    const data = req.body;
    // TODO: Implement using use case
    res.status(201).json({ message: 'Created ${className}', data });
  }`;
      case 'update':
        return `  /**
   * PUT /${pluralCamel}/:id
   */
  async update${className}(req: any, res: any): Promise<void> {
    const { id } = req.params;
    const data = req.body;
    // TODO: Implement using use case
    res.json({ id, message: 'Updated ${className}', data });
  }`;
      case 'delete':
        return `  /**
   * DELETE /${pluralCamel}/:id
   */
  async delete${className}(req: any, res: any): Promise<void> {
    const { id } = req.params;
    // TODO: Implement using use case
    res.json({ id, message: 'Deleted ${className}' });
  }`;
      default:
        return '';
    }
  }).filter(Boolean).join('\n\n');

  return `/**
 * ${className} Controller
 * Generated by @struktos/cli
 */

import { RequestContext } from '@struktos/core';

export class ${className}Controller {
${methodImplementations}

  /**
   * Register routes with the adapter
   */
  registerRoutes(adapter: any): void {
    ${methods.includes('list') ? `adapter.get('/${pluralCamel}', this.list${className}s.bind(this));` : ''}
    ${methods.includes('get') ? `adapter.get('/${pluralCamel}/:id', this.get${className}.bind(this));` : ''}
    ${methods.includes('create') ? `adapter.post('/${pluralCamel}', this.create${className}.bind(this));` : ''}
    ${methods.includes('update') ? `adapter.put('/${pluralCamel}/:id', this.update${className}.bind(this));` : ''}
    ${methods.includes('delete') ? `adapter.delete('/${pluralCamel}/:id', this.delete${className}.bind(this));` : ''}
  }
}
`;
}


// ==================== New Generators (v0.3.0) ====================

/**
 * Generate middleware/interceptor file
 */
async function generateMiddlewareFile(
  name: string,
  options: { logging?: boolean; timing?: boolean }
): Promise<void> {
  console.log(chalk.bold.cyan('\n🔧 Struktos Code Generator - Middleware/Interceptor\n'));

  // Validate
  validateEntityName(name);

  // Check if in Struktos project
  if (!(await isStruktosProject())) {
    console.log(chalk.red('❌ Not a Struktos project!'));
    console.log(chalk.yellow('   Run this command in a project created with "struktos new"\n'));
    process.exit(1);
  }

  const className = toPascalCase(name);
  const kebabName = toKebabCase(name);

  console.log(chalk.bold('📋 Generation Plan:'));
  console.log(`   Interceptor: ${chalk.cyan(className + 'Interceptor')}`);
  if (options.logging) console.log(`   Template: ${chalk.cyan('Logging')}`);
  if (options.timing) console.log(`   Template: ${chalk.cyan('Timing')}`);
  console.log();

  const spinner = ora('Generating middleware files...').start();

  try {
    // Ensure directory exists
    await fs.ensureDir('src/infrastructure/middleware');

    // Determine which template to use
    let content: string;
    let fileName: string;

    if (options.logging) {
      content = generateLoggingMiddleware();
      fileName = 'logging.interceptor.ts';
    } else if (options.timing) {
      content = generateTimingMiddleware();
      fileName = 'timing.interceptor.ts';
    } else {
      content = generateMiddleware(name);
      fileName = `${kebabName}.interceptor.ts`;
    }

    // Write file
    spinner.text = 'Writing interceptor file...';
    await writeFile(
      path.join('src/infrastructure/middleware', fileName),
      content
    );

    spinner.succeed('Generated middleware file');

    console.log();
    console.log(chalk.green.bold('✅ Middleware generated successfully!'));
    console.log();
    console.log(chalk.bold('📁 Generated file:'));
    console.log(chalk.gray(`   src/infrastructure/middleware/${fileName}`));
    console.log();
    console.log(chalk.bold('📝 Usage:'));
    console.log();
    console.log(chalk.cyan(`   import { ${className}Interceptor } from './infrastructure/middleware/${kebabName}.interceptor';`));
    console.log();
    console.log(chalk.cyan(`   app.use(new ${className}Interceptor());`));
    console.log();

  } catch (error) {
    spinner.fail('Failed to generate middleware');
    throw error;
  }
}

/**
 * Generate use case file
 */
async function generateUseCaseFile(
  action: string,
  entityName: string,
  options: {
    withRepository?: boolean;
    withLogger?: boolean;
    withValidation?: boolean;
  }
): Promise<void> {
  console.log(chalk.bold.cyan('\n🔧 Struktos Code Generator - Use Case\n'));

  // Validate
  validateEntityName(action);
  validateEntityName(entityName);

  // Check if in Struktos project
  if (!(await isStruktosProject())) {
    console.log(chalk.red('❌ Not a Struktos project!'));
    console.log(chalk.yellow('   Run this command in a project created with "struktos new"\n'));
    process.exit(1);
  }

  const actionPascal = toPascalCase(action);
  const entityPascal = toPascalCase(entityName);
  const kebabAction = toKebabCase(action);
  const kebabEntity = toKebabCase(entityName);

  const className = `${actionPascal}${entityPascal}UseCase`;

  console.log(chalk.bold('📋 Generation Plan:'));
  console.log(`   Use Case: ${chalk.cyan(className)}`);
  console.log(`   Action: ${chalk.cyan(action)}`);
  console.log(`   Entity: ${chalk.cyan(entityName)}`);
  console.log(`   Options:`);
  console.log(`      - Repository: ${options.withRepository ? chalk.green('Yes') : chalk.gray('No')}`);
  console.log(`      - Logger: ${options.withLogger ? chalk.green('Yes') : chalk.gray('No')}`);
  console.log(`      - Validation: ${options.withValidation ? chalk.green('Yes') : chalk.gray('No')}`);
  console.log();

  const spinner = ora('Generating use case files...').start();

  try {
    // Ensure directory exists
    const useCaseDir = path.join('src/application/use-cases', kebabEntity);
    await fs.ensureDir(useCaseDir);

    // Generate content
    const content = generateUseCase(action, entityName, options);

    // Write file
    const fileName = `${kebabAction}-${kebabEntity}.use-case.ts`;
    spinner.text = 'Writing use case file...';
    await writeFile(path.join(useCaseDir, fileName), content);

    spinner.succeed('Generated use case file');

    console.log();
    console.log(chalk.green.bold('✅ Use Case generated successfully!'));
    console.log();
    console.log(chalk.bold('📁 Generated file:'));
    console.log(chalk.gray(`   src/application/use-cases/${kebabEntity}/${fileName}`));
    console.log();
    console.log(chalk.bold('📝 Usage:'));
    console.log();
    console.log(chalk.cyan(`   import { ${className} } from './application/use-cases/${kebabEntity}/${fileName.replace('.ts', '')}';`));
    console.log();
    console.log(chalk.cyan(`   const useCase = new ${className}(repository, logger);`));
    console.log(chalk.cyan(`   const result = await useCase.execute(context, input);`));
    console.log();

  } catch (error) {
    spinner.fail('Failed to generate use case');
    throw error;
  }
}

/**
 * Generate gRPC client adapter file
 */
async function generateClientFile(
  serviceName: string,
  withPort?: boolean
): Promise<void> {
  console.log(chalk.bold.cyan('\n🔧 Struktos Code Generator - gRPC Client\n'));

  // Validate
  validateEntityName(serviceName);

  // Check if in Struktos project
  if (!(await isStruktosProject())) {
    console.log(chalk.red('❌ Not a Struktos project!'));
    console.log(chalk.yellow('   Run this command in a project created with "struktos new"\n'));
    process.exit(1);
  }

  const className = toPascalCase(serviceName);
  const kebabName = toKebabCase(serviceName);

  console.log(chalk.bold('📋 Generation Plan:'));
  console.log(`   Client: ${chalk.cyan(className + 'ClientAdapter')}`);
  console.log(`   Port Interface: ${withPort ? chalk.green('Yes') : chalk.gray('No')}`);
  console.log();

  const spinner = ora('Generating client files...').start();

  try {
    // Ensure directories exist
    await fs.ensureDir('src/infrastructure/adapters/grpc');

    // Generate client adapter
    spinner.text = 'Generating client adapter...';
    const adapterContent = generateGrpcClientAdapter(serviceName);
    await writeFile(
      path.join('src/infrastructure/adapters/grpc', `${kebabName}.client.adapter.ts`),
      adapterContent
    );
    spinner.succeed('Generated client adapter');

    // Generate port interface if requested
    if (withPort) {
      await fs.ensureDir('src/application/ports/grpc');
      
      spinner.start('Generating port interface...');
      const portContent = generateClientPortInterface(serviceName);
      await writeFile(
        path.join('src/application/ports/grpc', `${kebabName}.client.port.ts`),
        portContent
      );
      spinner.succeed('Generated port interface');
    }

    console.log();
    console.log(chalk.green.bold('✅ gRPC Client generated successfully!'));
    console.log();
    console.log(chalk.bold('📁 Generated files:'));
    console.log(chalk.gray(`   src/infrastructure/adapters/grpc/${kebabName}.client.adapter.ts`));
    if (withPort) {
      console.log(chalk.gray(`   src/application/ports/grpc/${kebabName}.client.port.ts`));
    }
    console.log();
    console.log(chalk.bold('📝 Usage:'));
    console.log();
    console.log(chalk.cyan(`   import { ${className}ClientAdapter } from './infrastructure/adapters/grpc/${kebabName}.client.adapter';`));
    console.log();
    console.log(chalk.cyan(`   const client = new ${className}ClientAdapter(grpcClientFactory);`));
    console.log(chalk.cyan(`   const result = await client.get(context, 'some-id');`));
    console.log();

  } catch (error) {
    spinner.fail('Failed to generate client');
    throw error;
  }
}