/**
 * Field definition for entity generation
 */
export interface FieldDefinition {
  name: string;
  type: string;
  optional?: boolean;
}

/**
 * Supported TypeScript types
 */
const VALID_TYPES = [
  'string',
  'number',
  'boolean',
  'Date',
  'any',
  'unknown'
];

/**
 * Parse field definitions from command line input
 * 
 * @example
 * parseFields("name:string,age:number,email:string?")
 * // Returns: [
 * //   { name: 'name', type: 'string', optional: false },
 * //   { name: 'age', type: 'number', optional: false },
 * //   { name: 'email', type: 'string', optional: true }
 * // ]
 */
export function parseFields(fieldsInput: string): FieldDefinition[] {
  if (!fieldsInput || fieldsInput.trim().length === 0) {
    return [];
  }

  const fields: FieldDefinition[] = [];
  const fieldPairs = fieldsInput.split(',').map(f => f.trim());

  for (const pair of fieldPairs) {
    if (!pair) continue;

    const [name, typeWithOptional] = pair.split(':').map(s => s.trim());

    if (!name || !typeWithOptional) {
      throw new Error(
        `Invalid field definition: "${pair}". Expected format: "fieldName:type" or "fieldName:type?"`
      );
    }

    // Check for optional marker (?)
    const optional = typeWithOptional.endsWith('?');
    const type = optional ? typeWithOptional.slice(0, -1) : typeWithOptional;

    // Validate type
    if (!VALID_TYPES.includes(type)) {
      throw new Error(
        `Invalid type "${type}" for field "${name}". Valid types: ${VALID_TYPES.join(', ')}`
      );
    }

    fields.push({
      name,
      type,
      optional
    });
  }

  return fields;
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Validate entity name
 */
export function validateEntityName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new Error('Entity name is required');
  }

  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
    throw new Error(
      'Entity name must start with a letter and contain only letters and numbers'
    );
  }
}