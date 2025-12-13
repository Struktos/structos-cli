import { toPascalCase } from '../utils/fieldParser';
import { FieldDefinition } from "../types"

/**
 * Generate Domain Entity file content
 */
export function generateEntityFile(entityName: string, fields: FieldDefinition[]): string {
  const className = toPascalCase(entityName);
  
  // Generate constructor parameters
  const constructorParams = fields
    .map(f => `    public readonly ${f.name}${f.optional ? '?' : ''}: ${f.type}`)
    .join(',\n');

  // Generate validation methods if applicable
  const validationMethods = generateValidationMethods(fields);

  return `/**
 * ${className} Domain Entity
 * 
 * This entity represents the core business concept of ${className}.
 * It contains business logic and rules for ${className}.
 */
export class ${className} {
  constructor(
${constructorParams}
  ) {}
${validationMethods}
  /**
   * Convert entity to plain object
   */
  toObject() {
    return {
${fields.map(f => `      ${f.name}: this.${f.name}`).join(',\n')}
    };
  }

  /**
   * Create entity from plain object
   */
  static fromObject(data: {
${fields.map(f => `    ${f.name}${f.optional ? '?' : ''}: ${f.type};`).join('\n')}
  }): ${className} {
    return new ${className}(
${fields.map(f => `      data.${f.name}`).join(',\n')}
    );
  }
}
`;
}

/**
 * Generate validation methods based on field types
 */
function generateValidationMethods(fields: FieldDefinition[]): string {
  const validations: string[] = [];

  // Email validation
  const emailField = fields.find(f => f.name.toLowerCase().includes('email'));
  if (emailField) {
    validations.push(`
  /**
   * Validate email format
   */
  isEmailValid(): boolean {
    if (!this.${emailField.name}) return ${emailField.optional ? 'true' : 'false'};
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(this.${emailField.name});
  }`);
  }

  // Price/Amount validation
  const priceField = fields.find(f => 
    f.type === 'number' && 
    (f.name.toLowerCase().includes('price') || f.name.toLowerCase().includes('amount'))
  );
  if (priceField) {
    validations.push(`
  /**
   * Validate ${priceField.name} is positive
   */
  is${toPascalCase(priceField.name)}Valid(): boolean {
    return this.${priceField.name} > 0;
  }`);
  }

  return validations.length > 0 ? '\n' + validations.join('\n') : '';
}

/**
 * Generate Repository Interface file content
 */
export function generateRepositoryInterface(entityName: string, fields: FieldDefinition[]): string {
  const className = toPascalCase(entityName);
  const idField = fields.find(f => f.name.toLowerCase() === 'id') || { name: 'id', type: 'string' };

  return `import { ${className} } from '../../domain/entities/${className}.entity';

/**
 * ${className} Repository Interface (Port)
 * 
 * This is a port in Hexagonal Architecture.
 * The actual implementation will be in infrastructure/adapters/persistence
 */
export interface I${className}Repository {
  /**
   * Find ${entityName} by ID
   */
  findById(${idField.name}: ${idField.type}): Promise<${className} | null>;

  /**
   * Find all ${entityName}s
   */
  findAll(): Promise<${className}[]>;

  /**
   * Create a new ${entityName}
   */
  create(${entityName}: Omit<${className}, '${idField.name}'>): Promise<${className}>;

  /**
   * Update an existing ${entityName}
   */
  update(${idField.name}: ${idField.type}, updates: Partial<${className}>): Promise<${className} | null>;

  /**
   * Delete a ${entityName}
   */
  delete(${idField.name}: ${idField.type}): Promise<boolean>;
}
`;
}

/**
 * Generate Repository Implementation file content
 */
export function generateRepositoryImplementation(entityName: string, fields: FieldDefinition[]): string {
  const className = toPascalCase(entityName);
  const idField = fields.find(f => f.name.toLowerCase() === 'id') || { name: 'id', type: 'string' };

  return `import { ${className} } from '../../../domain/entities/${className}.entity';
import { I${className}Repository } from '../../../domain/repositories/I${className}Repository';

/**
 * In-Memory ${className} Repository Implementation
 * 
 * This is a concrete implementation of the repository interface.
 * Replace this with a real database implementation (Prisma, TypeORM, etc.)
 */
export class InMemory${className}Repository implements I${className}Repository {
  private ${entityName}s: Map<${idField.type}, ${className}> = new Map();
  private currentId = 1;

  async findById(${idField.name}: ${idField.type}): Promise<${className} | null> {
    return this.${entityName}s.get(${idField.name}) || null;
  }

  async findAll(): Promise<${className}[]> {
    return Array.from(this.${entityName}s.values());
  }

  async create(${entityName}Data: Omit<${className}, '${idField.name}'>): Promise<${className}> {
    const ${idField.name} = ${idField.type === 'string' ? `String(this.currentId++)` : 'this.currentId++'};
    const ${entityName} = new ${className}(
      ${idField.name},
${fields.filter(f => f.name !== idField.name).map(f => `      ${entityName}Data.${f.name}`).join(',\n')}
    );
    
    this.${entityName}s.set(${idField.name}, ${entityName});
    return ${entityName};
  }

  async update(
    ${idField.name}: ${idField.type},
    updates: Partial<${className}>
  ): Promise<${className} | null> {
    const existing = this.${entityName}s.get(${idField.name});
    if (!existing) return null;

    const updated = new ${className}(
${fields.map(f => `      updates.${f.name} !== undefined ? updates.${f.name} : existing.${f.name}`).join(',\n')}
    );

    this.${entityName}s.set(${idField.name}, updated);
    return updated;
  }

  async delete(${idField.name}: ${idField.type}): Promise<boolean> {
    return this.${entityName}s.delete(${idField.name});
  }
}
`;
}