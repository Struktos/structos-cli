# 🔧 Struktos Generate Command

## Overview

The `struktos generate` command is a powerful code generator that creates complete Hexagonal Architecture implementations with a single command.

## Usage

```bash
struktos generate entity <name> --fields="field1:type,field2:type,..."
```

**Alias:**
```bash
struktos g entity <name> -f "field1:type,field2:type,..."
```

## Arguments

- `<name>` - Name of the entity to generate (e.g., Product, User, Order)

## Options

- `-f, --fields <fields>` - Field definitions in format `name:type,name:type`

## Supported Types

- `string` - String type
- `number` - Number type  
- `boolean` - Boolean type
- `Date` - Date type
- `any` - Any type
- `unknown` - Unknown type

**Optional Fields:**
Add `?` after the type to make a field optional:
```bash
--fields="description:string?"
```

## Examples

### Basic Entity

```bash
struktos generate entity Product --fields="name:string,price:number"
```

**Generated:**
- `Product.entity.ts` with id, name, price fields
- Complete CRUD use cases
- Repository interface and implementation

### Entity with Optional Fields

```bash
struktos generate entity User --fields="username:string,email:string,bio:string?,age:number?"
```

### Complex Entity

```bash
struktos g entity Order --fields="customerId:string,totalAmount:number,status:string,isPaid:boolean,createdAt:Date"
```

## Generated Files

For an entity named `Product`, the following files are generated:

### Domain Layer

```
src/domain/entities/Product.entity.ts
src/domain/repositories/IProductRepository.ts
```

**Product.entity.ts:**
```typescript
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly description?: string
  ) {}

  isPriceValid(): boolean {
    return this.price > 0;
  }

  toObject() { ... }
  static fromObject(data) { ... }
}
```

### Application Layer

```
src/application/use-cases/create-product.usecase.ts
src/application/use-cases/get-product.usecase.ts
src/application/use-cases/list-products.usecase.ts
src/application/use-cases/update-product.usecase.ts
src/application/use-cases/delete-product.usecase.ts
```

**create-product.usecase.ts:**
```typescript
export interface CreateProductInput {
  name: string;
  price: number;
  description?: string;
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    this.validateInput(input);
    return await this.productRepository.create(input);
  }

  private validateInput(input: CreateProductInput): void {
    // Automatic validation based on field types
  }
}
```

### Infrastructure Layer

```
src/infrastructure/adapters/persistence/Product.repository.ts
```

**Product.repository.ts:**
```typescript
export class InMemoryProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map();
  
  async findById(id: string): Promise<Product | null> { ... }
  async findAll(): Promise<Product[]> { ... }
  async create(product: Omit<Product, 'id'>): Promise<Product> { ... }
  async update(id: string, updates: Partial<Product>): Promise<Product | null> { ... }
  async delete(id: string): Promise<boolean> { ... }
}
```

## Smart Features

### 1. Automatic ID Field

If you don't specify an `id` field, it's automatically added:

```bash
struktos g entity Product --fields="name:string,price:number"
# Generates with: id:string, name:string, price:number
```

### 2. Validation Logic

The generator adds smart validation based on field names and types:

**Email fields:**
```typescript
if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
  throw new Error('Invalid email format');
}
```

**Price/Amount fields:**
```typescript
if (this.price !== undefined && this.price < 0) {
  throw new Error('price must be positive');
}
```

### 3. Type-Safe Code

All generated code is fully typed with TypeScript:

```typescript
interface CreateProductInput {
  name: string;        // Required
  price: number;       // Required
  description?: string; // Optional
}
```

### 4. Complete CRUD Operations

Every entity gets 5 use cases:
- **Create** - Create new entity
- **Get** - Get entity by ID
- **List** - Get all entities
- **Update** - Update existing entity
- **Delete** - Delete entity

## Workflow

### 1. Generate Entity

```bash
cd my-struktos-app
struktos generate entity Product --fields="name:string,price:number,stock:number"
```

### 2. Review Generated Files

```
✅ Entity generated successfully!

📁 Generated files:

Domain Layer:
   src/domain/entities/Product.entity.ts
   src/domain/repositories/IProductRepository.ts

Application Layer:
   src/application/use-cases/create-product.usecase.ts
   src/application/use-cases/get-product.usecase.ts
   src/application/use-cases/list-products.usecase.ts
   src/application/use-cases/update-product.usecase.ts
   src/application/use-cases/delete-product.usecase.ts

Infrastructure Layer:
   src/infrastructure/adapters/persistence/Product.repository.ts
```

### 3. Customize Business Logic

Edit `Product.entity.ts` to add domain-specific methods:

```typescript
export class Product {
  // ... generated code ...

  // Add custom business logic
  isInStock(): boolean {
    return this.stock > 0;
  }

  canPurchase(quantity: number): boolean {
    return this.stock >= quantity;
  }

  reduceStock(quantity: number): void {
    if (!this.canPurchase(quantity)) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
  }
}
```

### 4. Integrate with Controllers

Create HTTP controllers in `src/infrastructure/adapters/http`:

```typescript
import { CreateProductUseCase } from '../../../application/use-cases/create-product.usecase';
import { InMemoryProductRepository } from '../persistence/Product.repository';

const repository = new InMemoryProductRepository();
const createProductUseCase = new CreateProductUseCase(repository);

app.post('/products', async (req, res) => {
  const product = await createProductUseCase.execute(req.body);
  res.status(201).json(product);
});
```

## Requirements

The `generate` command must be run inside a Struktos project created with `struktos new`.

**Required directory structure:**
```
src/
├── domain/
│   ├── entities/
│   └── repositories/
├── application/
│   └── use-cases/
└── infrastructure/
    └── adapters/
        └── persistence/
```

## Error Handling

### Invalid Entity Name

```bash
$ struktos g entity 123Product
❌ Entity name must start with a letter
```

### Invalid Field Type

```bash
$ struktos g entity Product --fields="name:invalid"
❌ Invalid type "invalid". Valid types: string, number, boolean, Date, any, unknown
```

### Invalid Field Format

```bash
$ struktos g entity Product --fields="name"
❌ Invalid field definition: "name". Expected format: "fieldName:type"
```

### Not a Struktos Project

```bash
$ struktos g entity Product --fields="name:string"
❌ Not a Struktos project!
   Run this command in a project created with "struktos new"
```

## Tips

### 1. Start with Core Entities

Generate your domain's core entities first:

```bash
struktos g entity User --fields="username:string,email:string"
struktos g entity Product --fields="name:string,price:number"
struktos g entity Order --fields="userId:string,totalAmount:number"
```

### 2. Add Relationships Later

Start with basic fields, then add relationships in code:

```typescript
export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly totalAmount: number
  ) {}

  // Add after generation
  private items: OrderItem[] = [];
  
  addItem(item: OrderItem): void {
    this.items.push(item);
  }
}
```

### 3. Replace In-Memory Repository

The generated repository is for development. Replace with real DB:

```typescript
// Replace InMemoryProductRepository with PrismaProductRepository
export class PrismaProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    const data = await this.prisma.product.findUnique({ where: { id } });
    return data ? Product.fromObject(data) : null;
  }
  
  // ... other methods
}
```

## Benefits

✅ **Save Time** - Generate complete CRUD in seconds
✅ **Consistent Code** - Same structure across all entities  
✅ **Type Safe** - Full TypeScript support
✅ **Best Practices** - Hexagonal Architecture enforced
✅ **Clean Code** - Separation of concerns
✅ **Testable** - Each layer independently testable

---
