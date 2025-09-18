import { Page, Request, Response, Route } from '@playwright/test';

/**
 * Advanced Network Simulation Utilities for Paramarsh SMS
 * 
 * Provides comprehensive network condition testing including:
 * - Slow network simulation (3G, 2G speeds)
 * - Offline mode testing
 * - Request/Response interception and modification
 * - API failure simulation
 * - Load balancing and timeout testing
 * - Network resilience validation
 * - Cache behavior testing
 */

export interface NetworkCondition {
  name: string;
  downloadThroughput: number; // bytes per second
  uploadThroughput: number;   // bytes per second
  latency: number;            // milliseconds
  offline?: boolean;
}

export interface RequestMockConfig {
  url: string | RegExp;
  method?: string;
  status?: number;
  body?: any;
  headers?: { [key: string]: string };
  delay?: number;
  failureRate?: number; // 0-1, probability of failure
}

export interface NetworkTestResult {
  condition: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  slowestRequest: number;
  totalDataTransferred: number;
  timeouts: number;
  errors: string[];
}

export class NetworkSimulator {
  private page: Page;
  private cdpSession: any;
  private interceptedRequests: Map<string, { startTime: number; endTime?: number; size: number; success: boolean }> = new Map();
  private mockRoutes: Map<string, RequestMockConfig> = new Map();

  // Predefined network conditions
  static readonly CONDITIONS: { [key: string]: NetworkCondition } = {
    // Fast conditions
    'wifi': {
      name: 'WiFi',
      downloadThroughput: 30 * 1024 * 1024 / 8, // 30 Mbps
      uploadThroughput: 15 * 1024 * 1024 / 8,   // 15 Mbps  
      latency: 10
    },
    'ethernet': {
      name: 'Ethernet',
      downloadThroughput: 100 * 1024 * 1024 / 8, // 100 Mbps
      uploadThroughput: 100 * 1024 * 1024 / 8,   // 100 Mbps
      latency: 5
    },

    // Mobile conditions
    '4g': {
      name: '4G',
      downloadThroughput: 10 * 1024 * 1024 / 8, // 10 Mbps
      uploadThroughput: 5 * 1024 * 1024 / 8,    // 5 Mbps
      latency: 50
    },
    '3g-fast': {
      name: '3G Fast',
      downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
      uploadThroughput: 750 * 1024 / 8,           // 750 Kbps
      latency: 150
    },
    '3g-slow': {
      name: '3G Slow',
      downloadThroughput: 500 * 1024 / 8, // 500 Kbps
      uploadThroughput: 500 * 1024 / 8,   // 500 Kbps
      latency: 400
    },
    '2g': {
      name: '2G',
      downloadThroughput: 50 * 1024 / 8, // 50 Kbps
      uploadThroughput: 20 * 1024 / 8,   // 20 Kbps
      latency: 800
    },

    // Extreme conditions
    'offline': {
      name: 'Offline',
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
      offline: true
    },
    'very-slow': {
      name: 'Very Slow',
      downloadThroughput: 10 * 1024 / 8, // 10 Kbps
      uploadThroughput: 5 * 1024 / 8,    // 5 Kbps  
      latency: 2000
    }
  };

  constructor(page: Page) {
    this.page = page;
    this.setupRequestTracking();
  }

  /**
   * Initialize CDP session for network emulation
   */
  async initialize(): Promise<void> {
    this.cdpSession = await this.page.context().newCDPSession(this.page);
    await this.cdpSession.send('Network.enable');
  }

  /**
   * Setup request tracking
   */
  private setupRequestTracking(): void {
    this.page.on('request', (request) => {
      const id = `${request.method()}-${request.url()}`;
      this.interceptedRequests.set(id, {
        startTime: Date.now(),
        size: 0,
        success: false
      });
    });

    this.page.on('response', (response) => {
      const id = `${response.request().method()}-${response.url()}`;
      const requestData = this.interceptedRequests.get(id);
      if (requestData) {
        requestData.endTime = Date.now();
        requestData.success = response.ok();
        requestData.size = parseInt(response.headers()['content-length'] || '0', 10);
      }
    });

    this.page.on('requestfailed', (request) => {
      const id = `${request.method()}-${request.url()}`;
      const requestData = this.interceptedRequests.get(id);
      if (requestData) {
        requestData.endTime = Date.now();
        requestData.success = false;
      }
    });
  }

  /**
   * Apply network conditions
   */
  async applyNetworkCondition(condition: NetworkCondition): Promise<void> {
    if (!this.cdpSession) {
      await this.initialize();
    }

    console.log(`🌐 Applying network condition: ${condition.name}`);

    await this.cdpSession.send('Network.emulateNetworkConditions', {
      offline: condition.offline || false,
      downloadThroughput: condition.downloadThroughput,
      uploadThroughput: condition.uploadThroughput,
      latency: condition.latency
    });
  }

  /**
   * Disable network throttling
   */
  async disableThrottling(): Promise<void> {
    if (!this.cdpSession) {
      await this.initialize();
    }

    await this.cdpSession.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0
    });
  }

  /**
   * Mock API responses
   */
  async mockApiResponse(config: RequestMockConfig): Promise<void> {
    const routeKey = `${config.method || 'GET'}-${config.url}`;
    this.mockRoutes.set(routeKey, config);

    await this.page.route(config.url, async (route: Route, request: Request) => {
      // Simulate failure rate
      if (config.failureRate && Math.random() < config.failureRate) {
        await route.abort('failed');
        return;
      }

      // Add delay if specified
      if (config.delay && config.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }

      // Return mock response
      await route.fulfill({
        status: config.status || 200,
        headers: config.headers || { 'content-type': 'application/json' },
        body: typeof config.body === 'string' ? config.body : JSON.stringify(config.body)
      });
    });
  }

  /**
   * Simulate API failures
   */
  async simulateApiFailures(
    apiPattern: string | RegExp,
    failureRate: number = 0.5,
    failureTypes: ('timeout' | 'network-error' | '500' | '404' | '503')[] = ['network-error', '500']
  ): Promise<void> {
    await this.page.route(apiPattern, async (route: Route, request: Request) => {
      if (Math.random() < failureRate) {
        const failureType = failureTypes[Math.floor(Math.random() * failureTypes.length)];
        
        switch (failureType) {
          case 'timeout':
            // Simulate timeout by delaying then aborting
            await new Promise(resolve => setTimeout(resolve, 30000));
            await route.abort('timedout');
            break;
          case 'network-error':
            await route.abort('failed');
            break;
          case '500':
            await route.fulfill({
              status: 500,
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ error: 'Internal Server Error' })
            });
            break;
          case '404':
            await route.fulfill({
              status: 404,
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ error: 'Not Found' })
            });
            break;
          case '503':
            await route.fulfill({
              status: 503,
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ error: 'Service Unavailable' })
            });
            break;
        }
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Test network resilience
   */
  async testNetworkResilience(
    testAction: () => Promise<void>,
    condition: NetworkCondition,
    timeout: number = 60000
  ): Promise<NetworkTestResult> {
    console.log(`🔧 Testing network resilience under ${condition.name} conditions`);

    // Clear previous tracking data
    this.interceptedRequests.clear();

    // Apply network condition
    await this.applyNetworkCondition(condition);

    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Execute the test action with timeout
      await Promise.race([
        testAction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), timeout)
        )
      ]);
    } catch (error) {
      errors.push(error.message);
    }

    const endTime = Date.now();

    // Analyze results
    const requests = Array.from(this.interceptedRequests.values());
    const completedRequests = requests.filter(r => r.endTime);
    const successfulRequests = completedRequests.filter(r => r.success);
    const failedRequests = completedRequests.filter(r => !r.success);
    const timeouts = requests.filter(r => !r.endTime).length;

    const latencies = completedRequests.map(r => r.endTime! - r.startTime);
    const averageLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const slowestRequest = latencies.length > 0 ? Math.max(...latencies) : 0;
    const totalDataTransferred = requests.reduce((sum, r) => sum + r.size, 0);

    // Reset network conditions
    await this.disableThrottling();

    return {
      condition: condition.name,
      totalRequests: requests.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      averageLatency,
      slowestRequest,
      totalDataTransferred,
      timeouts,
      errors
    };
  }

  /**
   * Test offline functionality
   */
  async testOfflineMode(
    testAction: () => Promise<void>,
    expectedBehavior: 'fail' | 'graceful' | 'cached' = 'graceful'
  ): Promise<{ behavior: string; success: boolean; errors: string[] }> {
    console.log('📴 Testing offline mode functionality');

    const errors: string[] = [];
    let behavior = 'unknown';
    let success = false;

    try {
      // Go offline
      await this.applyNetworkCondition(NetworkSimulator.CONDITIONS.offline);
      
      // Wait a moment for offline state to take effect
      await this.page.waitForTimeout(1000);

      // Execute test action
      await testAction();

      // If we get here without errors, the app handled offline gracefully
      behavior = 'graceful';
      success = expectedBehavior === 'graceful' || expectedBehavior === 'cached';

    } catch (error) {
      errors.push(error.message);
      
      if (error.message.includes('net::ERR_INTERNET_DISCONNECTED') || 
          error.message.includes('Failed to fetch')) {
        behavior = 'fail';
        success = expectedBehavior === 'fail';
      } else {
        behavior = 'error';
        success = false;
      }
    } finally {
      // Restore network
      await this.disableThrottling();
    }

    return { behavior, success, errors };
  }

  /**
   * Test cache behavior
   */
  async testCacheBehavior(
    url: string,
    cacheExpectation: 'should-cache' | 'should-not-cache' | 'should-revalidate'
  ): Promise<{ cached: boolean; revalidated: boolean; success: boolean }> {
    console.log(`💾 Testing cache behavior for: ${url}`);

    let cached = false;
    let revalidated = false;

    // First request - should hit the server
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');

    // Track subsequent requests
    const requestsSeen = new Set<string>();
    
    this.page.on('request', (request) => {
      if (request.url() === url) {
        requestsSeen.add(`${request.method()}-${request.url()}`);
      }
    });

    // Second request - test caching
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');

    // Check cache headers and request count
    const response = await this.page.goto(url);
    const cacheControl = response?.headers()['cache-control'] || '';
    const etag = response?.headers()['etag'] || '';
    const lastModified = response?.headers()['last-modified'] || '';

    cached = cacheControl.includes('max-age') || Boolean(etag) || Boolean(lastModified);
    revalidated = requestsSeen.size > 1;

    let success = false;
    switch (cacheExpectation) {
      case 'should-cache':
        success = cached;
        break;
      case 'should-not-cache':
        success = !cached;
        break;
      case 'should-revalidate':
        success = revalidated;
        break;
    }

    return { cached, revalidated, success };
  }

  /**
   * Generate network test report
   */
  static generateReport(results: NetworkTestResult[]): string {
    const totalTests = results.length;
    const successfulTests = results.filter(r => r.errors.length === 0).length;
    
    let report = `
🌐 Network Resilience Test Report
=================================

📊 Summary:
- Total Conditions Tested: ${totalTests}
- Successful Tests: ${successfulTests}
- Failed Tests: ${totalTests - successfulTests}

📈 Detailed Results:
`;

    results.forEach(result => {
      const statusIcon = result.errors.length === 0 ? '✅' : '❌';
      report += `
${statusIcon} ${result.condition}:
  - Total Requests: ${result.totalRequests}
  - Successful: ${result.successfulRequests}
  - Failed: ${result.failedRequests}
  - Timeouts: ${result.timeouts}
  - Avg Latency: ${Math.round(result.averageLatency)}ms
  - Slowest Request: ${Math.round(result.slowestRequest)}ms
  - Data Transferred: ${Math.round(result.totalDataTransferred / 1024)}KB`;
      
      if (result.errors.length > 0) {
        report += `\n  - Errors: ${result.errors.join(', ')}`;
      }
    });

    return report.trim();
  }
}

/**
 * High-level network testing helpers
 */
export class NetworkTestHelper {
  /**
   * Test page load under various network conditions
   */
  static async testPageLoadResilience(
    page: Page,
    url: string,
    conditions: string[] = ['wifi', '3g-fast', '3g-slow', '2g']
  ): Promise<void> {
    console.log(`🚀 Testing page load resilience for: ${url}`);

    const simulator = new NetworkSimulator(page);
    const results: NetworkTestResult[] = [];

    for (const conditionName of conditions) {
      const condition = NetworkSimulator.CONDITIONS[conditionName];
      if (!condition) {
        console.warn(`Unknown network condition: ${conditionName}`);
        continue;
      }

      const result = await simulator.testNetworkResilience(
        async () => {
          await page.goto(url);
          await page.waitForLoadState('networkidle', { timeout: 60000 });
        },
        condition,
        60000
      );

      results.push(result);

      // Ensure the page loaded successfully under this condition
      if (condition.name !== 'Offline' && result.errors.length > 0) {
        console.warn(`Page failed to load under ${condition.name} conditions: ${result.errors.join(', ')}`);
      }
    }

    console.log(NetworkSimulator.generateReport(results));

    // Verify that the page loads under reasonable conditions
    const criticalConditions = results.filter(r => 
      ['WiFi', '4G', '3G Fast'].includes(r.condition)
    );
    
    const criticalFailures = criticalConditions.filter(r => r.errors.length > 0);
    if (criticalFailures.length > 0) {
      throw new Error(`Page failed to load under critical network conditions: ${criticalFailures.map(f => f.condition).join(', ')}`);
    }
  }

  /**
   * Test API resilience
   */
  static async testApiResilience(
    page: Page,
    apiEndpoint: string | RegExp,
    apiCalls: () => Promise<void>,
    maxAcceptableFailures: number = 2
  ): Promise<void> {
    console.log('🔧 Testing API resilience...');

    const simulator = new NetworkSimulator(page);

    // Test with API failures
    await simulator.simulateApiFailures(apiEndpoint, 0.3, ['500', '503', 'timeout']);

    let failures = 0;
    const maxRetries = 5;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await apiCalls();
        console.log(`✅ API call ${i + 1} succeeded`);
      } catch (error) {
        failures++;
        console.log(`❌ API call ${i + 1} failed: ${error.message}`);
        
        if (failures > maxAcceptableFailures) {
          throw new Error(`API resilience test failed: ${failures} failures exceeded threshold of ${maxAcceptableFailures}`);
        }
      }
      
      // Wait between retries
      await page.waitForTimeout(1000);
    }

    console.log(`✅ API resilience test passed: ${failures}/${maxRetries} failures (threshold: ${maxAcceptableFailures})`);
  }

  /**
   * Test offline functionality
   */
  static async testOfflineFunctionality(
    page: Page,
    offlineAction: () => Promise<void>,
    expectedBehavior: 'fail' | 'graceful' | 'cached' = 'graceful'
  ): Promise<void> {
    console.log('📴 Testing offline functionality...');

    const simulator = new NetworkSimulator(page);
    const result = await simulator.testOfflineMode(offlineAction, expectedBehavior);

    if (!result.success) {
      throw new Error(`Offline test failed. Expected: ${expectedBehavior}, Got: ${result.behavior}. Errors: ${result.errors.join(', ')}`);
    }

    console.log(`✅ Offline functionality test passed: ${result.behavior} behavior as expected`);
  }

  /**
   * Test form submission resilience
   */
  static async testFormSubmissionResilience(
    page: Page,
    formSelector: string,
    fillFormAction: () => Promise<void>,
    submitAction: () => Promise<void>
  ): Promise<void> {
    console.log('📝 Testing form submission resilience...');

    const simulator = new NetworkSimulator(page);

    // Test under slow network conditions
    await simulator.applyNetworkCondition(NetworkSimulator.CONDITIONS['3g-slow']);

    try {
      await fillFormAction();
      
      const startTime = Date.now();
      await submitAction();
      const submitTime = Date.now() - startTime;

      console.log(`⏱️ Form submission took ${submitTime}ms under slow network`);

      // Should complete within reasonable time even on slow network
      if (submitTime > 30000) { // 30 seconds
        throw new Error(`Form submission too slow: ${submitTime}ms`);
      }

      // Check for success indicators
      await page.waitForLoadState('networkidle');

    } finally {
      await simulator.disableThrottling();
    }

    console.log('✅ Form submission resilience test passed');
  }
}