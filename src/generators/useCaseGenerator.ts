import { FieldDefinition, toPascalCase, toCamelCase } from '../utils/fieldParser';

/**
 * Generate Create Use Case file content
 */
export function generateCreateUseCase(entityName: string, fields: FieldDefinition[]): string {
  const className = toPascalCase(entityName);
  const camelName = toCamelCase(entityName);
  const idField = fields.find(f => f.name.toLowerCase() === 'id') || { name: 'id', type: 'string' };
  const nonIdFields = fields.filter(f => f.name !== idField.name);

  return `import { ${className} } from '../../domain/entities/${className}.entity';
import { I${className}Repository } from '../../domain/repositories/I${className}Repository';

/**
 * Input DTO for Create${className} use case
 */
export interface Create${className}Input {
${nonIdFields.map(f => `  ${f.name}${f.optional ? '?' : ''}: ${f.type};`).join('\n')}
}

/**
 * Create${className} Use Case
 * 
 * This use case handles the creation of a new ${className}.
 * It encapsulates the business logic for creating ${entityName}s.
 */
export class Create${className}UseCase {
  constructor(
    private readonly ${camelName}Repository: I${className}Repository
  ) {}

  /**
   * Execute the use case
   */
  async execute(input: Create${className}Input): Promise<${className}> {
    // Validate input
    this.validateInput(input);

    // Create entity
    const ${camelName} = await this.${camelName}Repository.create(input);

    return ${camelName};
  }

  /**
   * Validate input data
   */
  private validateInput(input: Create${className}Input): void {
${generateValidationLogic(nonIdFields, camelName)}
  }
}
`;
}

/**
 * Generate validation logic for use case
 */
function generateValidationLogic(fields: FieldDefinition[], entityName: string): string {
  const validations: string[] = [];

  fields.forEach(field => {
    if (!field.optional) {
      if (field.type === 'string') {
        validations.push(`    if (!input.${field.name} || input.${field.name}.trim().length === 0) {
      throw new Error('${field.name} is required');
    }`);
      } else {
        validations.push(`    if (input.${field.name} === undefined || input.${field.name} === null) {
      throw new Error('${field.name} is required');
    }`);
      }
    }

    // Email validation
    if (field.name.toLowerCase().includes('email')) {
      validations.push(`
    if (input.${field.name} && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input.${field.name})) {
      throw new Error('Invalid email format');
    }`);
    }

    // Price/Amount validation
    if (field.type === 'number' && 
        (field.name.toLowerCase().includes('price') || field.name.toLowerCase().includes('amount'))) {
      validations.push(`
    if (input.${field.name} !== undefined && input.${field.name} < 0) {
      throw new Error('${field.name} must be positive');
    }`);
    }
  });

  return validations.length > 0 ? validations.join('\n') : '    // No validation needed';
}

/**
 * Generate Get Use Case file content
 */
export function generateGetUseCase(entityName: string, fields: FieldDefinition[]): string {
  const className = toPascalCase(entityName);
  const camelName = toCamelCase(entityName);
  const idField = fields.find(f => f.name.toLowerCase() === 'id') || { name: 'id', type: 'string' };

  return `import { ${className} } from '../../domain/entities/${className}.entity';
import { I${className}Repository } from '../../domain/repositories/I${className}Repository';

/**
 * Get${className}ById Use Case
 * 
 * This use case retrieves a ${className} by its ID.
 */
export class Get${className}ByIdUseCase {
  constructor(
    private readonly ${camelName}Repository: I${className}Repository
  ) {}

  /**
   * Execute the use case
   */
  async execute(${idField.name}: ${idField.type}): Promise<${className}> {
    const ${camelName} = await this.${camelName}Repository.findById(${idField.name});

    if (!${camelName}) {
      throw new Error(\`${className} with ${idField.name} \${${idField.name}} not found\`);
    }

    return ${camelName};
  }
}
`;
}

/**
 * Generate List Use Case file content
 */
export function generateListUseCase(entityName: string, fields: FieldDefinition[]): string {
  const className = toPascalCase(entityName);
  const camelName = toCamelCase(entityName);

  return `import { ${className} } from '../../domain/entities/${className}.entity';
import { I${className}Repository } from '../../domain/repositories/I${className}Repository';

/**
 * List${className}s Use Case
 * 
 * This use case retrieves all ${className}s.
 */
export class List${className}sUseCase {
  constructor(
    private readonly ${camelName}Repository: I${className}Repository
  ) {}

  /**
   * Execute the use case
   */
  async execute(): Promise<${className}[]> {
    return await this.${camelName}Repository.findAll();
  }
}
`;
}

/**
 * Generate Update Use Case file content
 */
export function generateUpdateUseCase(entityName: string, fields: FieldDefinition[]): string {
  const className = toPascalCase(entityName);
  const camelName = toCamelCase(entityName);
  const idField = fields.find(f => f.name.toLowerCase() === 'id') || { name: 'id', type: 'string' };

  return `import { ${className} } from '../../domain/entities/${className}.entity';
import { I${className}Repository } from '../../domain/repositories/I${className}Repository';

/**
 * Input DTO for Update${className} use case
 */
export interface Update${className}Input {
${fields.filter(f => f.name !== idField.name).map(f => `  ${f.name}?: ${f.type};`).join('\n')}
}

/**
 * Update${className} Use Case
 * 
 * This use case handles updating an existing ${className}.
 */
export class Update${className}UseCase {
  constructor(
    private readonly ${camelName}Repository: I${className}Repository
  ) {}

  /**
   * Execute the use case
   */
  async execute(${idField.name}: ${idField.type}, input: Update${className}Input): Promise<${className}> {
    const updated = await this.${camelName}Repository.update(${idField.name}, input);

    if (!updated) {
      throw new Error(\`${className} with ${idField.name} \${${idField.name}} not found\`);
    }

    return updated;
  }
}
`;
}

/**
 * Generate Delete Use Case file content
 */
export function generateDeleteUseCase(entityName: string, fields: FieldDefinition[]): string {
  const className = toPascalCase(entityName);
  const camelName = toCamelCase(entityName);
  const idField = fields.find(f => f.name.toLowerCase() === 'id') || { name: 'id', type: 'string' };

  return `import { I${className}Repository } from '../../domain/repositories/I${className}Repository';

/**
 * Delete${className} Use Case
 * 
 * This use case handles deleting a ${className}.
 */
export class Delete${className}UseCase {
  constructor(
    private readonly ${camelName}Repository: I${className}Repository
  ) {}

  /**
   * Execute the use case
   */
  async execute(${idField.name}: ${idField.type}): Promise<void> {
    const deleted = await this.${camelName}Repository.delete(${idField.name});

    if (!deleted) {
      throw new Error(\`${className} with ${idField.name} \${${idField.name}} not found\`);
    }
  }
}
`;
}