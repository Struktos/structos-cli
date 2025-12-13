/**
 * Field Parser Unit Tests
 */

import {
  parseFields,
  validateType,
  validateEntityName,
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  pluralize,
} from '../../src/utils/fieldParser';

describe('fieldParser', () => {
  describe('parseFields', () => {
    it('should parse simple field definitions', () => {
      const result = parseFields('name:string,age:number');
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'name', type: 'string', optional: false });
      expect(result[1]).toEqual({ name: 'age', type: 'number', optional: false });
    });

    it('should parse optional fields with ?', () => {
      const result = parseFields('name:string,bio:string?');
      
      expect(result).toHaveLength(2);
      expect(result[0].optional).toBe(false);
      expect(result[1].optional).toBe(true);
    });

    it('should handle all supported types', () => {
      const result = parseFields('a:string,b:number,c:boolean,d:Date,e:any,f:unknown');
      
      expect(result).toHaveLength(6);
      expect(result.map(f => f.type)).toEqual(['string', 'number', 'boolean', 'Date', 'any', 'unknown']);
    });

    it('should handle whitespace in names', () => {
      const result = parseFields('  name:string , age:number  ');
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('name');
      expect(result[0].type).toBe('string');
      expect(result[1].name).toBe('age');
    });

    it('should return empty array for empty input', () => {
      expect(parseFields('')).toEqual([]);
      expect(parseFields('   ')).toEqual([]);
    });

    it('should throw error for invalid format', () => {
      expect(() => parseFields('invalidfield')).toThrow('Invalid field format');
      expect(() => parseFields('name:')).toThrow('Invalid field format');
      expect(() => parseFields(':string')).toThrow('Invalid field format');
    });

    it('should throw error for invalid type', () => {
      expect(() => parseFields('name:invalid')).toThrow('Invalid type');
    });
  });

  describe('validateType', () => {
    it('should accept valid types', () => {
      expect(() => validateType('string')).not.toThrow();
      expect(() => validateType('number')).not.toThrow();
      expect(() => validateType('boolean')).not.toThrow();
      expect(() => validateType('Date')).not.toThrow();
      expect(() => validateType('any')).not.toThrow();
      expect(() => validateType('unknown')).not.toThrow();
    });

    it('should reject invalid types', () => {
      expect(() => validateType('String')).toThrow('Invalid type');
      expect(() => validateType('int')).toThrow('Invalid type');
      expect(() => validateType('float')).toThrow('Invalid type');
      expect(() => validateType('object')).toThrow('Invalid type');
    });
  });

  describe('validateEntityName', () => {
    it('should accept valid entity names', () => {
      expect(() => validateEntityName('User')).not.toThrow();
      expect(() => validateEntityName('Product')).not.toThrow();
      expect(() => validateEntityName('OrderItem')).not.toThrow();
      expect(() => validateEntityName('User123')).not.toThrow();
    });

    it('should reject empty names', () => {
      expect(() => validateEntityName('')).toThrow('Entity name is required');
    });

    it('should reject names starting with numbers', () => {
      expect(() => validateEntityName('123User')).toThrow();
    });

    it('should reject names with special characters', () => {
      expect(() => validateEntityName('user-name')).toThrow();
      expect(() => validateEntityName('user_name')).toThrow();
      expect(() => validateEntityName('user.name')).toThrow();
    });
  });

  describe('toPascalCase', () => {
    it('should convert to PascalCase', () => {
      expect(toPascalCase('user')).toBe('User');
      expect(toPascalCase('userProfile')).toBe('UserProfile');
      expect(toPascalCase('user-profile')).toBe('UserProfile');
      expect(toPascalCase('user_profile')).toBe('UserProfile');
    });

    it('should handle already PascalCase', () => {
      expect(toPascalCase('User')).toBe('User');
      expect(toPascalCase('UserProfile')).toBe('UserProfile');
    });
  });

  describe('toCamelCase', () => {
    it('should convert to camelCase', () => {
      expect(toCamelCase('User')).toBe('user');
      expect(toCamelCase('UserProfile')).toBe('userProfile');
      expect(toCamelCase('user-profile')).toBe('userProfile');
      expect(toCamelCase('user_profile')).toBe('userProfile');
    });
  });

  describe('toKebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(toKebabCase('User')).toBe('user');
      expect(toKebabCase('UserProfile')).toBe('user-profile');
      expect(toKebabCase('userProfile')).toBe('user-profile');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert to snake_case', () => {
      expect(toSnakeCase('User')).toBe('user');
      expect(toSnakeCase('UserProfile')).toBe('user_profile');
      expect(toSnakeCase('userProfile')).toBe('user_profile');
    });
  });

  describe('pluralize', () => {
    it('should pluralize regular words', () => {
      expect(pluralize('user')).toBe('users');
      expect(pluralize('product')).toBe('products');
    });

    it('should pluralize words ending in y', () => {
      expect(pluralize('category')).toBe('categories');
      expect(pluralize('company')).toBe('companies');
    });

    it('should pluralize words ending in s, x, ch, sh', () => {
      expect(pluralize('class')).toBe('classes');
      expect(pluralize('box')).toBe('boxes');
      expect(pluralize('match')).toBe('matches');
      expect(pluralize('wish')).toBe('wishes');
    });
  });
});