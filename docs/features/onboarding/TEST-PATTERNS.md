# Onboarding E2E Test Patterns Reference

## Quick Reference for Test Patterns

This document provides reusable patterns from the onboarding E2E test suite.

## Basic Test Setup

### Test File Structure
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API Feature (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: string;

  beforeAll(async () => {
    // App initialization
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        validationError: { target: false },
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    testUserId = `test-user-${Date.now()}`;
  });

  afterAll(async () => {
    // Cleanup
    await app.close();
  });
});
```

## Pattern 1: Testing GET Endpoints

### Get with Create-if-Not-Found Pattern
```typescript
it('should create new state if not found', async () => {
  const newUserId = `new-user-${Date.now()}`;

  const response = await request(app.getHttpServer())
    .get('/api/resource/state')
    .set('X-User-Id', newUserId)
    .expect(200);

  // Verify created with defaults
  expect(response.body).toHaveProperty('data');
  expect(response.body.data).toHaveProperty('id');
  expect(response.body.data).toHaveProperty('userId', newUserId);
  expect(response.body.data).toHaveProperty('currentStep', 1);

  // Cleanup
  await prisma.resource.delete({
    where: { id: response.body.data.id },
  });
});
```

### Get Existing Resource Pattern
```typescript
it('should return existing resource if found', async () => {
  // Create resource directly in database
  const existing = await prisma.resource.create({
    data: {
      userId: testUserId,
      field1: 'value1',
      field2: 'value2',
    },
  });

  const response = await request(app.getHttpServer())
    .get('/api/resource/state')
    .set('X-User-Id', testUserId)
    .expect(200);

  expect(response.body.data).toHaveProperty('id', existing.id);
  expect(response.body.data).toHaveProperty('field1', 'value1');

  // Cleanup
  await prisma.resource.delete({ where: { id: existing.id } });
});
```

## Pattern 2: Testing POST Endpoints

### Create with Required Fields
```typescript
it('should create with all required fields', async () => {
  const createData = {
    requiredField1: 'value1',
    requiredField2: 'value2',
    requiredField3: 'value3',
  };

  const response = await request(app.getHttpServer())
    .post('/api/resource')
    .set('X-User-Id', testUserId)
    .send(createData)
    .expect(200);

  expect(response.body).toHaveProperty('data');
  expect(response.body.data).toMatchObject(createData);
});
```

### Create with Optional Fields
```typescript
it('should handle optional fields', async () => {
  const dataWithOptional = {
    requiredField: 'value',
    optionalField1: 'optional1',
    optionalField2: 'optional2',
  };

  const response = await request(app.getHttpServer())
    .post('/api/resource')
    .set('X-User-Id', testUserId)
    .send(dataWithOptional)
    .expect(200);

  expect(response.body.data).toMatchObject(dataWithOptional);
  expect(response.body.data.optionalField1).toBe('optional1');
});
```

## Pattern 3: Validation Testing

### Required Field Validation
```typescript
it('should validate required field: fieldName', async () => {
  const invalidData = {
    otherField: 'value',
    // fieldName missing
  };

  await request(app.getHttpServer())
    .post('/api/resource')
    .set('X-User-Id', testUserId)
    .send(invalidData)
    .expect(400);
});
```

### Empty Value Validation
```typescript
it('should return 400 for empty required field', async () => {
  const invalidData = {
    requiredField: '', // Empty string
    otherField: 'value',
  };

  await request(app.getHttpServer())
    .post('/api/resource')
    .set('X-User-Id', testUserId)
    .send(invalidData)
    .expect(400);
});
```

### Structure Validation
```typescript
it('should validate data structure - must have array', async () => {
  const invalidData = {
    items: 'not an array', // Should be array
  };

  await request(app.getHttpServer())
    .post('/api/resource')
    .set('X-User-Id', testUserId)
    .send(invalidData)
    .expect(400);
});

it('should validate data structure - array cannot be empty', async () => {
  const invalidData = {
    items: [], // Empty array
  };

  await request(app.getHttpServer())
    .post('/api/resource')
    .set('X-User-Id', testUserId)
    .send(invalidData)
    .expect(400);
});
```

### Format Validation
```typescript
it('should validate time format (HH:MM)', async () => {
  const invalidData = {
    time: '8:00', // Invalid (should be 08:00)
  };

  await request(app.getHttpServer())
    .post('/api/resource')
    .set('X-User-Id', testUserId)
    .send(invalidData)
    .expect(400);
});
```

## Pattern 4: React Admin Format Testing

### Standard Response Format
```typescript
it('should return data in React Admin format', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/resource')
    .set('X-User-Id', testUserId)
    .send(validData)
    .expect(200);

  // Must have { data: Resource } format
  expect(response.body).toHaveProperty('data');
  expect(response.body.data).toHaveProperty('id');
  expect(response.body.data).toHaveProperty('userId', testUserId);
});
```

### Response with Additional Fields
```typescript
it('should return data with additional summary', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/resource/action')
    .set('X-User-Id', testUserId)
    .expect(200);

  expect(response.body).toHaveProperty('data');
  expect(response.body).toHaveProperty('summary');
  expect(typeof response.body.summary).toBe('object');
});
```

## Pattern 5: State Transition Testing

### Step Completion Pattern
```typescript
it('should mark step N complete and update currentStep to N+1', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/resource/step-n')
    .set('X-User-Id', testUserId)
    .expect(200);

  expect(response.body.data.currentStep).toBe(nextStep);
  const completedSteps = JSON.parse(response.body.data.completedSteps);
  expect(completedSteps).toContain(currentStep);
});
```

### Boolean Flag Update Pattern
```typescript
it('should mark flag as true', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/resource/action')
    .set('X-User-Id', testUserId)
    .expect(200);

  expect(response.body.data.flagName).toBe(true);
});
```

## Pattern 6: Authentication Testing

### Unauthorized Access Pattern
```typescript
it('should return 401 if not authenticated', async () => {
  await request(app.getHttpServer())
    .get('/api/resource')
    // No X-User-Id header
    .expect(401);
});
```

### Authenticated Request Pattern
```typescript
const response = await request(app.getHttpServer())
  .get('/api/resource')
  .set('X-User-Id', testUserId)
  .expect(200);
```

## Pattern 7: Idempotency Testing

### Multiple Calls Pattern
```typescript
it('should handle calling endpoint multiple times', async () => {
  const data = { field: 'value' };

  // First call
  const response1 = await request(app.getHttpServer())
    .post('/api/resource/action')
    .set('X-User-Id', testUserId)
    .send(data)
    .expect(200);

  // Second call with same data
  const response2 = await request(app.getHttpServer())
    .post('/api/resource/action')
    .set('X-User-Id', testUserId)
    .send(data)
    .expect(200);

  // Verify no duplication in array
  const items = JSON.parse(response2.body.data.arrayField);
  const uniqueItems = new Set(items);
  expect(items.length).toBe(uniqueItems.size);
});
```

## Pattern 8: Data Cleanup

### Test Isolation with Hooks
```typescript
describe('Feature Tests', () => {
  let resourceId: string;

  beforeEach(async () => {
    // Setup test data
    const resource = await prisma.resource.create({
      data: { userId: testUserId, field: 'value' },
    });
    resourceId = resource.id;
  });

  afterEach(async () => {
    // Cleanup test data
    if (resourceId) {
      await prisma.resource.delete({ where: { id: resourceId } });
      resourceId = null;
    }
  });

  it('test case', async () => {
    // Test uses resourceId
  });
});
```

### Conditional Cleanup Pattern
```typescript
afterAll(async () => {
  // Cleanup test data
  if (testResourceId) {
    await prisma.resource.deleteMany({
      where: { userId: testUserId },
    });
  }
  if (testBranchId) {
    await prisma.branch.deleteMany({
      where: { id: testBranchId },
    });
  }
});
```

## Pattern 9: Timestamp Validation

### CreatedAt/UpdatedAt Pattern
```typescript
it('should set timestamp correctly', async () => {
  const beforeTime = new Date();

  const response = await request(app.getHttpServer())
    .post('/api/resource/action')
    .set('X-User-Id', testUserId)
    .expect(200);

  const afterTime = new Date();
  const timestamp = new Date(response.body.data.timestampField);

  expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
  expect(timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
});
```

## Pattern 10: Complete Flow Testing

### End-to-End Flow Pattern
```typescript
describe('Complete Flow End-to-End', () => {
  let flowUserId: string;
  let flowResourceId: string;

  beforeAll(() => {
    flowUserId = `flow-test-${Date.now()}`;
  });

  afterAll(async () => {
    // Cleanup all flow data
    if (flowResourceId) {
      await prisma.resource.deleteMany({ where: { userId: flowUserId } });
    }
  });

  it('should complete entire flow from step 1 to N', async () => {
    // Step 1: Initial action
    const step1Response = await request(app.getHttpServer())
      .post('/api/resource/step-1')
      .set('X-User-Id', flowUserId)
      .send(step1Data)
      .expect(200);

    flowResourceId = step1Response.body.data.id;
    expect(step1Response.body.data.currentStep).toBe(2);

    // Step 2: Next action
    const step2Response = await request(app.getHttpServer())
      .post('/api/resource/step-2')
      .set('X-User-Id', flowUserId)
      .expect(200);

    expect(step2Response.body.data.currentStep).toBe(3);

    // ... continue through all steps

    // Final step: Completion
    const finalResponse = await request(app.getHttpServer())
      .post('/api/resource/complete')
      .set('X-User-Id', flowUserId)
      .expect(200);

    expect(finalResponse.body.data.completed).toBe(true);

    // Verify all steps completed
    const completedSteps = JSON.parse(finalResponse.body.data.completedSteps);
    expect(completedSteps).toContain(1);
    expect(completedSteps).toContain(2);
    // ... verify all steps
  });
});
```

## Pattern 11: Related Resource Testing

### Resource Creation with Foreign Keys
```typescript
it('should create resource with related data', async () => {
  // Create dependent resource first
  const parentResponse = await request(app.getHttpServer())
    .get('/api/parent-resource')
    .set('X-User-Id', testUserId);

  const parentId = parentResponse.body.data[0]?.id;
  if (!parentId) return; // Skip if no parent data

  const createData = {
    field: 'value',
    parentId: parentId,
  };

  const response = await request(app.getHttpServer())
    .post('/api/child-resource')
    .set('X-User-Id', testUserId)
    .send(createData)
    .expect(201);

  expect(response.body.data.parentId).toBe(parentId);
});
```

## Pattern 12: Data Summary Testing

### Summary Response Pattern
```typescript
it('should return summary with realistic counts', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/resource/generate')
    .set('X-User-Id', testUserId)
    .expect(200);

  const summary = response.body.summary;
  expect(summary.itemsCreated).toBeGreaterThanOrEqual(expectedMin);
  expect(summary.relatedItemsCreated).toBeGreaterThanOrEqual(expectedMin);
  expect(summary.totalCount).toBe(
    summary.itemsCreated + summary.relatedItemsCreated
  );
});
```

## Best Practices

### 1. Test Naming
- Use descriptive test names: `should <expected behavior> <condition>`
- Group related tests in describe blocks
- Use clear variable names

### 2. Test Isolation
- Always cleanup after tests
- Use unique IDs for test data
- Don't rely on test execution order

### 3. Assertions
- Test one thing per test case
- Use specific matchers (toHaveProperty, toMatchObject)
- Verify both positive and negative cases

### 4. Data Management
- Create minimal test data
- Use realistic test data (Indian context for this project)
- Clean up all created data

### 5. Error Testing
- Test all validation rules
- Test edge cases (empty, null, invalid format)
- Test authentication failures

### 6. Performance
- Skip tests when dependencies missing (use `if (!id) return`)
- Use parallel test execution when possible
- Minimize database operations

---

**Document Created**: 2025-10-08
**Source**: Onboarding E2E test implementation
**Purpose**: Reusable patterns for future E2E tests
