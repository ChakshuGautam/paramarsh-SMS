import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

/**
 * TestAppFactory - Eliminates boilerplate test setup code
 * Provides consistent test application configuration across all E2E tests
 */
export class TestAppFactory {
  private static instance: TestAppFactory;
  private app: INestApplication | null = null;
  private moduleFixture: TestingModule | null = null;

  // Singleton pattern to reuse app instance across tests if needed
  static getInstance(): TestAppFactory {
    if (!TestAppFactory.instance) {
      TestAppFactory.instance = new TestAppFactory();
    }
    return TestAppFactory.instance;
  }

  /**
   * Creates and initializes a test application
   * Standardizes all test configuration in one place
   */
  async createTestApp(options?: {
    useRandomPort?: boolean;
    enableValidation?: boolean;
    globalPrefix?: string;
    customModules?: any[];
  }): Promise<INestApplication> {
    const {
      useRandomPort = true,
      enableValidation = true,
      globalPrefix = 'api/v1',
      customModules = [],
    } = options || {};

    // Set random port for parallel test execution
    if (useRandomPort) {
      process.env.PORT = '0';
    }

    // Create testing module with AppModule and any custom modules
    this.moduleFixture = await Test.createTestingModule({
      imports: [AppModule, ...customModules],
    }).compile();

    // Create the application
    this.app = this.moduleFixture.createNestApplication();

    // Set global prefix
    if (globalPrefix) {
      this.app.setGlobalPrefix(globalPrefix);
    }

    // Enable validation pipe if requested (default: true)
    if (enableValidation) {
      this.app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          transformOptions: {
            enableImplicitConversion: true,
          },
        }),
      );
    }

    // Initialize the application
    await this.app.init();

    return this.app;
  }

  /**
   * Get the current test application instance
   */
  getApp(): INestApplication {
    if (!this.app) {
      throw new Error('Test app not initialized. Call createTestApp() first.');
    }
    return this.app;
  }

  /**
   * Get the HTTP server for making requests
   */
  getHttpServer() {
    return this.getApp().getHttpServer();
  }

  /**
   * Clean up the test application
   */
  async closeApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
      this.app = null;
    }
    this.moduleFixture = null;
  }

  /**
   * Get the base URL for the test server
   */
  async getBaseUrl(): Promise<string> {
    if (!this.app) {
      throw new Error('Test app not initialized');
    }
    const server = this.getHttpServer();
    const address = server.address();
    const port = typeof address === 'object' ? address?.port : 3000;
    return `http://localhost:${port}`;
  }

  /**
   * Helper to create standard test headers
   */
  static getTestHeaders(branchId: string = 'branch1'): Record<string, string> {
    return {
      'X-Branch-Id': branchId,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Helper to parse React Admin filter format
   */
  static createFilterQuery(filter: Record<string, any>): string {
    return JSON.stringify(filter);
  }

  /**
   * Helper to create React Admin pagination params
   */
  static createPaginationParams(page: number = 1, perPage: number = 10): Record<string, any> {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
      range: JSON.stringify([start, end]),
      sort: JSON.stringify(['id', 'ASC']),
      filter: JSON.stringify({}),
    };
  }
}

/**
 * Convenience function for quick test app setup
 */
export async function createTestApp(options?: Parameters<TestAppFactory['createTestApp']>[0]): Promise<{
  app: INestApplication;
  httpServer: any;
  factory: TestAppFactory;
}> {
  const factory = new TestAppFactory();
  const app = await factory.createTestApp(options);
  const httpServer = factory.getHttpServer();
  
  return { app, httpServer, factory };
}

/**
 * Standard test setup and teardown hooks
 */
export function setupTestApp() {
  let app: INestApplication;
  let httpServer: any;
  let factory: TestAppFactory;

  beforeAll(async () => {
    const testSetup = await createTestApp();
    app = testSetup.app;
    httpServer = testSetup.httpServer;
    factory = testSetup.factory;
  });

  afterAll(async () => {
    await factory.closeApp();
  });

  return {
    getApp: () => app,
    getHttpServer: () => httpServer,
    getFactory: () => factory,
  };
}