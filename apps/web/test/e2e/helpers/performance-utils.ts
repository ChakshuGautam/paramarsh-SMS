import { Page, expect } from '@playwright/test';

/**
 * Advanced Performance Testing Utilities for Paramarsh SMS
 * 
 * Provides comprehensive performance monitoring capabilities including:
 * - Page load time measurement
 * - API response time tracking
 * - Memory usage monitoring
 * - Core Web Vitals collection
 * - Network request analysis
 * - Bundle size validation
 */

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  domContentLoaded: number;
  totalBlockingTime: number;
  memoryUsage?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
  networkRequests: {
    total: number;
    failed: number;
    averageResponseTime: number;
    slowestRequest: {
      url: string;
      duration: number;
    };
  };
}

export interface PerformanceThresholds {
  maxLoadTime: number; // 3000ms
  maxFirstContentfulPaint: number; // 1500ms
  maxLargestContentfulPaint: number; // 2500ms
  maxCumulativeLayoutShift: number; // 0.1
  maxFirstInputDelay: number; // 100ms
  maxTimeToInteractive: number; // 3000ms
  maxMemoryUsage: number; // 50MB
  maxApiResponseTime: number; // 1000ms
}

export class PerformanceMonitor {
  private page: Page;
  private startTime: number = 0;
  private networkRequests: Array<{ url: string; startTime: number; endTime?: number; success: boolean }> = [];

  // Default performance thresholds for Paramarsh SMS
  private static readonly DEFAULT_THRESHOLDS: PerformanceThresholds = {
    maxLoadTime: 3000,
    maxFirstContentfulPaint: 1500,
    maxLargestContentfulPaint: 2500,
    maxCumulativeLayoutShift: 0.1,
    maxFirstInputDelay: 100,
    maxTimeToInteractive: 3000,
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB in bytes
    maxApiResponseTime: 1000
  };

  constructor(page: Page) {
    this.page = page;
    this.setupRequestTracking();
  }

  /**
   * Setup network request tracking
   */
  private setupRequestTracking() {
    this.page.on('request', (request) => {
      this.networkRequests.push({
        url: request.url(),
        startTime: Date.now(),
        success: false
      });
    });

    this.page.on('response', (response) => {
      const request = this.networkRequests.find(req => 
        req.url === response.url() && !req.endTime
      );
      if (request) {
        request.endTime = Date.now();
        request.success = response.ok();
      }
    });

    this.page.on('requestfailed', (request) => {
      const req = this.networkRequests.find(r => 
        r.url === request.url() && !r.endTime
      );
      if (req) {
        req.endTime = Date.now();
        req.success = false;
      }
    });
  }

  /**
   * Start performance monitoring for a page navigation
   */
  async startMonitoring() {
    this.startTime = Date.now();
    this.networkRequests = [];
    
    // Start monitoring Core Web Vitals
    await this.page.addInitScript(() => {
      // Store performance metrics in window object
      (window as any).performanceMetrics = {
        navigationStart: performance.timeOrigin + performance.now(),
        webVitals: {}
      };

      // Monitor First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            (window as any).performanceMetrics.webVitals.fcp = entry.startTime;
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Monitor Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        (window as any).performanceMetrics.webVitals.lcp = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor Cumulative Layout Shift
      let cumulativeLayoutShift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cumulativeLayoutShift += (entry as any).value;
          }
        }
        (window as any).performanceMetrics.webVitals.cls = cumulativeLayoutShift;
      }).observe({ entryTypes: ['layout-shift'] });

      // Monitor First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).performanceMetrics.webVitals.fid = (entry as any).processingStart - entry.startTime;
        }
      }).observe({ entryTypes: ['first-input'] });
    });
  }

  /**
   * Navigate to a page and measure performance
   */
  async navigateAndMeasure(url: string): Promise<PerformanceMetrics> {
    await this.startMonitoring();
    
    const navigationStart = Date.now();
    await this.page.goto(url);
    
    // Wait for page to be fully loaded
    await this.page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - navigationStart;
    
    return await this.collectMetrics(loadTime);
  }

  /**
   * Collect comprehensive performance metrics
   */
  async collectMetrics(customLoadTime?: number): Promise<PerformanceMetrics> {
    // Wait a bit for all metrics to be collected
    await this.page.waitForTimeout(1000);

    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const webVitals = (window as any).performanceMetrics?.webVitals || {};
      
      // Memory usage (if available)
      const memoryInfo = (performance as any).memory;
      
      return {
        // Navigation timing
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        timeToInteractive: navigation.domInteractive - navigation.navigationStart,
        
        // Web Vitals
        firstContentfulPaint: webVitals.fcp || 0,
        largestContentfulPaint: webVitals.lcp || 0,
        cumulativeLayoutShift: webVitals.cls || 0,
        firstInputDelay: webVitals.fid || 0,
        
        // Memory info
        memoryUsage: memoryInfo ? {
          jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
          totalJSHeapSize: memoryInfo.totalJSHeapSize,
          usedJSHeapSize: memoryInfo.usedJSHeapSize
        } : undefined
      };
    });

    // Calculate network metrics
    const completedRequests = this.networkRequests.filter(req => req.endTime);
    const failedRequests = completedRequests.filter(req => !req.success);
    const responseTimes = completedRequests.map(req => req.endTime! - req.startTime);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    const slowestRequest = completedRequests.reduce((slowest, current) => {
      const currentDuration = current.endTime! - current.startTime;
      return currentDuration > slowest.duration 
        ? { url: current.url, duration: currentDuration }
        : slowest;
    }, { url: '', duration: 0 });

    return {
      loadTime: customLoadTime || metrics.loadComplete,
      firstContentfulPaint: metrics.firstContentfulPaint,
      largestContentfulPaint: metrics.largestContentfulPaint,
      cumulativeLayoutShift: metrics.cumulativeLayoutShift,
      firstInputDelay: metrics.firstInputDelay,
      timeToInteractive: metrics.timeToInteractive,
      domContentLoaded: metrics.domContentLoaded,
      totalBlockingTime: 0, // Would need more complex calculation
      memoryUsage: metrics.memoryUsage,
      networkRequests: {
        total: this.networkRequests.length,
        failed: failedRequests.length,
        averageResponseTime,
        slowestRequest
      }
    };
  }

  /**
   * Measure API response time
   */
  async measureApiResponse(apiCall: () => Promise<any>): Promise<number> {
    const startTime = Date.now();
    await apiCall();
    return Date.now() - startTime;
  }

  /**
   * Monitor page performance during user interactions
   */
  async measureInteraction(interaction: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await interaction();
    
    // Wait for any loading states to complete
    await this.page.waitForLoadState('networkidle');
    
    return Date.now() - startTime;
  }

  /**
   * Validate performance metrics against thresholds
   */
  static validateMetrics(
    metrics: PerformanceMetrics, 
    customThresholds?: Partial<PerformanceThresholds>
  ): { passed: boolean; failures: string[] } {
    const thresholds = { ...this.DEFAULT_THRESHOLDS, ...customThresholds };
    const failures: string[] = [];

    if (metrics.loadTime > thresholds.maxLoadTime) {
      failures.push(`Load time ${metrics.loadTime}ms exceeds threshold ${thresholds.maxLoadTime}ms`);
    }

    if (metrics.firstContentfulPaint > thresholds.maxFirstContentfulPaint) {
      failures.push(`FCP ${metrics.firstContentfulPaint}ms exceeds threshold ${thresholds.maxFirstContentfulPaint}ms`);
    }

    if (metrics.largestContentfulPaint > thresholds.maxLargestContentfulPaint) {
      failures.push(`LCP ${metrics.largestContentfulPaint}ms exceeds threshold ${thresholds.maxLargestContentfulPaint}ms`);
    }

    if (metrics.cumulativeLayoutShift > thresholds.maxCumulativeLayoutShift) {
      failures.push(`CLS ${metrics.cumulativeLayoutShift} exceeds threshold ${thresholds.maxCumulativeLayoutShift}`);
    }

    if (metrics.firstInputDelay > thresholds.maxFirstInputDelay) {
      failures.push(`FID ${metrics.firstInputDelay}ms exceeds threshold ${thresholds.maxFirstInputDelay}ms`);
    }

    if (metrics.memoryUsage && metrics.memoryUsage.usedJSHeapSize > thresholds.maxMemoryUsage) {
      failures.push(`Memory usage ${Math.round(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024)}MB exceeds threshold ${Math.round(thresholds.maxMemoryUsage / 1024 / 1024)}MB`);
    }

    if (metrics.networkRequests.averageResponseTime > thresholds.maxApiResponseTime) {
      failures.push(`Average API response time ${metrics.networkRequests.averageResponseTime}ms exceeds threshold ${thresholds.maxApiResponseTime}ms`);
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }

  /**
   * Generate performance report
   */
  static generateReport(metrics: PerformanceMetrics): string {
    const validation = this.validateMetrics(metrics);
    
    return `
📊 Performance Report
=====================

🚀 Core Web Vitals:
- Load Time: ${metrics.loadTime}ms
- First Contentful Paint: ${metrics.firstContentfulPaint}ms
- Largest Contentful Paint: ${metrics.largestContentfulPaint}ms
- Cumulative Layout Shift: ${metrics.cumulativeLayoutShift}
- First Input Delay: ${metrics.firstInputDelay}ms
- Time to Interactive: ${metrics.timeToInteractive}ms

🧠 Memory Usage:
${metrics.memoryUsage ? `
- Used Heap: ${Math.round(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024)}MB
- Total Heap: ${Math.round(metrics.memoryUsage.totalJSHeapSize / 1024 / 1024)}MB
- Heap Limit: ${Math.round(metrics.memoryUsage.jsHeapSizeLimit / 1024 / 1024)}MB
` : '- Memory info not available'}

🌐 Network Performance:
- Total Requests: ${metrics.networkRequests.total}
- Failed Requests: ${metrics.networkRequests.failed}
- Average Response Time: ${Math.round(metrics.networkRequests.averageResponseTime)}ms
- Slowest Request: ${metrics.networkRequests.slowestRequest.url} (${metrics.networkRequests.slowestRequest.duration}ms)

✅ Validation: ${validation.passed ? 'PASSED' : 'FAILED'}
${validation.failures.length > 0 ? '\n❌ Issues:\n' + validation.failures.map(f => `- ${f}`).join('\n') : ''}
    `.trim();
  }

  /**
   * Monitor bundle size and loading performance
   */
  async analyzeBundleSize(): Promise<{ totalSize: number; jsSize: number; cssSize: number; imageSize: number }> {
    const resourceSizes = await this.page.evaluate(() => {
      let totalSize = 0;
      let jsSize = 0;
      let cssSize = 0;
      let imageSize = 0;

      performance.getEntriesByType('resource').forEach((resource: any) => {
        const size = resource.transferSize || 0;
        totalSize += size;

        if (resource.name.includes('.js')) {
          jsSize += size;
        } else if (resource.name.includes('.css')) {
          cssSize += size;
        } else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
          imageSize += size;
        }
      });

      return { totalSize, jsSize, cssSize, imageSize };
    });

    return resourceSizes;
  }

  /**
   * Test performance under slow network conditions
   */
  async testSlowNetwork(networkCondition: 'slow3g' | 'fast3g' | 'offline' = 'slow3g') {
    const client = await this.page.context().newCDPSession(this.page);
    
    const conditions = {
      slow3g: {
        downloadThroughput: 500 * 1024 / 8, // 500 Kbps
        uploadThroughput: 500 * 1024 / 8,
        latency: 400
      },
      fast3g: {
        downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
        uploadThroughput: 750 * 1024 / 8, // 750 Kbps
        latency: 150
      },
      offline: {
        downloadThroughput: 0,
        uploadThroughput: 0,
        latency: 0
      }
    };

    await client.send('Network.emulateNetworkConditions', {
      offline: networkCondition === 'offline',
      ...conditions[networkCondition]
    });
  }

  /**
   * Disable network throttling
   */
  async disableNetworkThrottling() {
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0
    });
  }
}

/**
 * High-level performance testing helpers
 */
export class PerformanceTestHelper {
  /**
   * Test page load performance
   */
  static async testPageLoad(
    page: Page, 
    url: string, 
    expectedThresholds?: Partial<PerformanceThresholds>
  ): Promise<void> {
    console.log(`🚀 Testing page load performance for: ${url}`);
    
    const monitor = new PerformanceMonitor(page);
    const metrics = await monitor.navigateAndMeasure(url);
    
    console.log(PerformanceMonitor.generateReport(metrics));
    
    const validation = PerformanceMonitor.validateMetrics(metrics, expectedThresholds);
    
    if (!validation.passed) {
      throw new Error(`Performance test failed:\n${validation.failures.join('\n')}`);
    }
  }

  /**
   * Test form submission performance
   */
  static async testFormSubmission(
    page: Page,
    formFillAction: () => Promise<void>,
    submitAction: () => Promise<void>,
    maxSubmissionTime: number = 2000
  ): Promise<void> {
    console.log('📝 Testing form submission performance...');
    
    const monitor = new PerformanceMonitor(page);
    
    await formFillAction();
    
    const submissionTime = await monitor.measureInteraction(submitAction);
    
    console.log(`⏱️ Form submission took: ${submissionTime}ms`);
    
    expect(submissionTime).toBeLessThan(maxSubmissionTime);
  }

  /**
   * Test search performance
   */
  static async testSearchPerformance(
    page: Page,
    searchAction: (query: string) => Promise<void>,
    query: string = 'test',
    maxSearchTime: number = 1000
  ): Promise<void> {
    console.log(`🔍 Testing search performance for query: "${query}"`);
    
    const monitor = new PerformanceMonitor(page);
    
    const searchTime = await monitor.measureInteraction(() => searchAction(query));
    
    console.log(`⏱️ Search took: ${searchTime}ms`);
    
    expect(searchTime).toBeLessThan(maxSearchTime);
  }

  /**
   * Test large dataset performance
   */
  static async testLargeDatasetPerformance(
    page: Page,
    loadDataAction: () => Promise<void>,
    expectedMinItems: number = 100,
    maxLoadTime: number = 5000
  ): Promise<void> {
    console.log(`📊 Testing large dataset performance (expecting ${expectedMinItems}+ items)`);
    
    const monitor = new PerformanceMonitor(page);
    
    const loadTime = await monitor.measureInteraction(loadDataAction);
    
    console.log(`⏱️ Large dataset load took: ${loadTime}ms`);
    
    expect(loadTime).toBeLessThan(maxLoadTime);
  }
}