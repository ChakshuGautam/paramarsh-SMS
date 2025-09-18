import { Reporter, TestCase, TestResult, FullConfig, Suite } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Advanced Performance Reporter for Playwright E2E Tests
 * 
 * Provides comprehensive test execution analytics including:
 * - Performance metrics collection and analysis
 * - Test execution time tracking
 * - Browser performance monitoring
 * - Network request analysis
 * - Memory usage tracking
 * - Visual regression metrics
 * - Accessibility audit results
 * - Cross-browser performance comparison
 * - Historical trend analysis
 */

export interface PerformanceMetrics {
  testName: string;
  duration: number;
  status: string;
  browser: string;
  loadTime?: number;
  memoryUsage?: number;
  networkRequests?: {
    total: number;
    failed: number;
    averageResponseTime: number;
  };
  accessibilityScore?: number;
  visualDifferences?: number;
  retryCount: number;
  timestamp: string;
  error?: string;
}

export interface TestSuiteMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  averageTestDuration: number;
  performanceScore: number;
  accessibilityScore: number;
  networkReliability: number;
  browserBreakdown: { [browser: string]: number };
  slowestTests: PerformanceMetrics[];
  fastestTests: PerformanceMetrics[];
  failedTests: PerformanceMetrics[];
  performanceTrends: {
    currentRun: number;
    previousRun?: number;
    trend: 'improving' | 'degrading' | 'stable';
  };
}

export class PerformanceReporter implements Reporter {
  private config!: FullConfig;
  private suite!: Suite;
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = 0;
  private outputDir: string;
  private reportPath: string;
  private historicalDataPath: string;

  constructor(options: { outputDir?: string } = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'test-results', 'performance-reports');
    this.reportPath = path.join(this.outputDir, 'performance-report.json');
    this.historicalDataPath = path.join(this.outputDir, 'historical-data.json');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.config = config;
    this.suite = suite;
    this.startTime = Date.now();
    
    console.log('🚀 Performance Reporter: Starting test execution monitoring...');
    console.log(`📊 Monitoring ${this.getAllTests(suite).length} tests across ${config.projects.length} browser(s)`);
  }

  onTestBegin(test: TestCase): void {
    // Test started - could inject performance monitoring here
    console.log(`⏱️ Starting: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const browserName = test.parent.project()?.name || 'unknown';
    
    // Extract performance data from test attachments or annotations
    const performanceData = this.extractPerformanceData(test, result);
    
    const metric: PerformanceMetrics = {
      testName: this.getFullTestName(test),
      duration: result.duration,
      status: result.status,
      browser: browserName,
      retryCount: result.retry,
      timestamp: new Date().toISOString(),
      ...performanceData
    };

    if (result.error) {
      metric.error = result.error.message;
    }

    this.metrics.push(metric);

    // Log performance info
    const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${metric.testName} (${metric.duration}ms) [${browserName}]`);
    
    if (metric.loadTime) {
      console.log(`  📈 Load time: ${metric.loadTime}ms`);
    }
    
    if (metric.memoryUsage) {
      console.log(`  🧠 Memory: ${Math.round(metric.memoryUsage / 1024 / 1024)}MB`);
    }
    
    if (metric.networkRequests) {
      console.log(`  🌐 Network: ${metric.networkRequests.total} requests, ${metric.networkRequests.failed} failed`);
    }
  }

  onEnd(): void {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    console.log('\n📊 Generating performance report...');

    const suiteMetrics = this.calculateSuiteMetrics(totalDuration);
    
    // Generate reports
    this.generateJSONReport(suiteMetrics);
    this.generateHTMLReport(suiteMetrics);
    this.generateConsoleReport(suiteMetrics);
    this.updateHistoricalData(suiteMetrics);

    console.log(`📋 Performance report saved to: ${this.outputDir}`);
  }

  private getAllTests(suite: Suite): TestCase[] {
    const tests: TestCase[] = [];
    
    const collect = (suite: Suite) => {
      // Handle both old and new Playwright Suite structure
      const entries = suite.entries || suite.suites || [];
      
      // Try different iteration methods for compatibility
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          if (entry._type === 'test') {
            tests.push(entry as TestCase);
          } else if (entry._type === 'suite' || entry.suites || entry.tests) {
            collect(entry as Suite);
          }
        }
      } else if (suite.tests) {
        // Direct access to tests array if available
        for (const test of suite.tests) {
          tests.push(test as TestCase);
        }
      }
      
      // Also check for direct suites array
      if (suite.suites) {
        for (const subSuite of suite.suites) {
          collect(subSuite as Suite);
        }
      }
    };
    
    collect(suite);
    return tests;
  }

  private getFullTestName(test: TestCase): string {
    const parts: string[] = [];
    let current = test.parent;
    
    while (current && current.title) {
      parts.unshift(current.title);
      current = current.parent;
    }
    
    parts.push(test.title);
    return parts.join(' > ');
  }

  private extractPerformanceData(test: TestCase, result: TestResult): Partial<PerformanceMetrics> {
    const data: Partial<PerformanceMetrics> = {};

    // Extract from test annotations
    test.annotations.forEach(annotation => {
      if (annotation.type === 'performance') {
        try {
          const perfData = JSON.parse(annotation.description || '{}');
          Object.assign(data, perfData);
        } catch (error) {
          // Ignore invalid JSON
        }
      }
    });

    // Extract from attachments (screenshots, traces, etc.)
    result.attachments.forEach(attachment => {
      if (attachment.name === 'performance-metrics') {
        try {
          const perfData = JSON.parse(attachment.body?.toString() || '{}');
          Object.assign(data, perfData);
        } catch (error) {
          // Ignore invalid JSON
        }
      }
    });

    return data;
  }

  private calculateSuiteMetrics(totalDuration: number): TestSuiteMetrics {
    const passedTests = this.metrics.filter(m => m.status === 'passed');
    const failedTests = this.metrics.filter(m => m.status === 'failed');
    const skippedTests = this.metrics.filter(m => m.status === 'skipped');

    // Calculate browser breakdown
    const browserBreakdown: { [browser: string]: number } = {};
    this.metrics.forEach(metric => {
      browserBreakdown[metric.browser] = (browserBreakdown[metric.browser] || 0) + 1;
    });

    // Calculate performance scores
    const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length || 0;
    const avgLoadTime = this.metrics
      .filter(m => m.loadTime)
      .reduce((sum, m) => sum + (m.loadTime || 0), 0) / this.metrics.filter(m => m.loadTime).length || 0;
    const avgMemoryUsage = this.metrics
      .filter(m => m.memoryUsage)
      .reduce((sum, m) => sum + (m.memoryUsage || 0), 0) / this.metrics.filter(m => m.memoryUsage).length || 0;

    // Performance score calculation (0-100)
    let performanceScore = 100;
    if (avgLoadTime > 3000) performanceScore -= 20; // Slow load times
    if (avgDuration > 30000) performanceScore -= 15; // Slow tests
    if (avgMemoryUsage > 100 * 1024 * 1024) performanceScore -= 10; // High memory usage
    if (failedTests.length > 0) performanceScore -= (failedTests.length / this.metrics.length) * 30; // Failures

    // Accessibility score (if available)
    const accessibilityScores = this.metrics.filter(m => m.accessibilityScore);
    const avgAccessibilityScore = accessibilityScores.length > 0
      ? accessibilityScores.reduce((sum, m) => sum + (m.accessibilityScore || 0), 0) / accessibilityScores.length
      : 0;

    // Network reliability
    const networkMetrics = this.metrics.filter(m => m.networkRequests);
    const networkReliability = networkMetrics.length > 0
      ? networkMetrics.reduce((sum, m) => {
          const requests = m.networkRequests!;
          return sum + ((requests.total - requests.failed) / requests.total) * 100;
        }, 0) / networkMetrics.length
      : 100;

    // Find slowest and fastest tests
    const sortedByDuration = [...this.metrics].sort((a, b) => b.duration - a.duration);
    const slowestTests = sortedByDuration.slice(0, 5);
    const fastestTests = sortedByDuration.slice(-5).reverse();

    // Performance trends
    const historicalData = this.loadHistoricalData();
    const performanceTrends = this.calculateTrends(performanceScore, historicalData);

    return {
      totalTests: this.metrics.length,
      passedTests: passedTests.length,
      failedTests: failedTests.length,
      skippedTests: skippedTests.length,
      totalDuration,
      averageTestDuration: avgDuration,
      performanceScore: Math.round(performanceScore),
      accessibilityScore: Math.round(avgAccessibilityScore),
      networkReliability: Math.round(networkReliability),
      browserBreakdown,
      slowestTests,
      fastestTests,
      failedTests,
      performanceTrends
    };
  }

  private generateJSONReport(suiteMetrics: TestSuiteMetrics): void {
    const report = {
      timestamp: new Date().toISOString(),
      summary: suiteMetrics,
      detailedMetrics: this.metrics,
      config: {
        browsers: this.config.projects.map(p => p.name),
        workers: this.config.workers,
        retries: this.config.retries,
        timeout: this.config.timeout
      }
    };

    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
  }

  private generateHTMLReport(suiteMetrics: TestSuiteMetrics): void {
    const htmlPath = path.join(this.outputDir, 'performance-report.html');
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paramarsh SMS - E2E Performance Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; }
    .title { color: #2563eb; margin: 0 0 10px 0; font-size: 2.5rem; }
    .subtitle { color: #6b7280; margin: 0; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .metric-card { background: #f8fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #2563eb; }
    .metric-value { font-size: 2rem; font-weight: bold; color: #1f2937; margin: 0; }
    .metric-label { color: #6b7280; font-size: 0.875rem; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .section { margin-bottom: 40px; }
    .section-title { font-size: 1.5rem; color: #1f2937; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
    .test-list { background: #f8fafc; border-radius: 6px; overflow: hidden; }
    .test-item { padding: 15px 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: between; align-items: center; }
    .test-item:last-child { border-bottom: none; }
    .test-name { font-weight: 500; color: #1f2937; flex: 1; }
    .test-duration { color: #6b7280; font-family: monospace; }
    .status-passed { color: #059669; }
    .status-failed { color: #dc2626; }
    .status-skipped { color: #d97706; }
    .chart { height: 300px; background: #f8fafc; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #6b7280; }
    .trend-up { color: #059669; }
    .trend-down { color: #dc2626; }
    .trend-stable { color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">📊 E2E Performance Report</h1>
      <p class="subtitle">Paramarsh SMS Test Suite - ${new Date().toLocaleString()}</p>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <p class="metric-value">${suiteMetrics.totalTests}</p>
        <p class="metric-label">Total Tests</p>
      </div>
      <div class="metric-card">
        <p class="metric-value status-passed">${suiteMetrics.passedTests}</p>
        <p class="metric-label">Passed</p>
      </div>
      <div class="metric-card">
        <p class="metric-value status-failed">${suiteMetrics.failedTests}</p>
        <p class="metric-label">Failed</p>
      </div>
      <div class="metric-card">
        <p class="metric-value">${Math.round(suiteMetrics.totalDuration / 1000)}s</p>
        <p class="metric-label">Total Duration</p>
      </div>
      <div class="metric-card">
        <p class="metric-value">${suiteMetrics.performanceScore}/100</p>
        <p class="metric-label">Performance Score</p>
      </div>
      <div class="metric-card">
        <p class="metric-value">${suiteMetrics.accessibilityScore}/100</p>
        <p class="metric-label">Accessibility Score</p>
      </div>
      <div class="metric-card">
        <p class="metric-value">${suiteMetrics.networkReliability}%</p>
        <p class="metric-label">Network Reliability</p>
      </div>
      <div class="metric-card">
        <p class="metric-value ${suiteMetrics.performanceTrends.trend === 'improving' ? 'trend-up' : suiteMetrics.performanceTrends.trend === 'degrading' ? 'trend-down' : 'trend-stable'}">
          ${suiteMetrics.performanceTrends.trend === 'improving' ? '📈' : suiteMetrics.performanceTrends.trend === 'degrading' ? '📉' : '➡️'}
        </p>
        <p class="metric-label">Performance Trend</p>
      </div>
    </div>

    ${suiteMetrics.slowestTests.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🐌 Slowest Tests</h2>
      <div class="test-list">
        ${suiteMetrics.slowestTests.map(test => `
          <div class="test-item">
            <span class="test-name">${test.testName}</span>
            <span class="test-duration">${test.duration}ms</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    ${suiteMetrics.failedTests.length > 0 ? `
    <div class="section">
      <h2 class="section-title">❌ Failed Tests</h2>
      <div class="test-list">
        ${suiteMetrics.failedTests.map(test => `
          <div class="test-item">
            <span class="test-name">${test.testName}</span>
            <span class="test-duration status-failed">${test.error || 'Test failed'}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <div class="section">
      <h2 class="section-title">🌐 Browser Breakdown</h2>
      <div class="test-list">
        ${Object.entries(suiteMetrics.browserBreakdown).map(([browser, count]) => `
          <div class="test-item">
            <span class="test-name">${browser}</span>
            <span class="test-duration">${count} tests</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
</body>
</html>
    `;

    fs.writeFileSync(htmlPath, html);
  }

  private generateConsoleReport(suiteMetrics: TestSuiteMetrics): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PERFORMANCE REPORT SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n📈 Test Execution:`);
    console.log(`  Total Tests: ${suiteMetrics.totalTests}`);
    console.log(`  ✅ Passed: ${suiteMetrics.passedTests}`);
    console.log(`  ❌ Failed: ${suiteMetrics.failedTests}`);
    console.log(`  ⚠️ Skipped: ${suiteMetrics.skippedTests}`);
    console.log(`  ⏱️ Total Duration: ${Math.round(suiteMetrics.totalDuration / 1000)}s`);
    console.log(`  📊 Average Test Duration: ${Math.round(suiteMetrics.averageTestDuration)}ms`);

    console.log(`\n🎯 Quality Scores:`);
    console.log(`  🚀 Performance Score: ${suiteMetrics.performanceScore}/100`);
    console.log(`  ♿ Accessibility Score: ${suiteMetrics.accessibilityScore}/100`);
    console.log(`  🌐 Network Reliability: ${suiteMetrics.networkReliability}%`);

    const trendIcon = suiteMetrics.performanceTrends.trend === 'improving' ? '📈' : 
                     suiteMetrics.performanceTrends.trend === 'degrading' ? '📉' : '➡️';
    console.log(`  📊 Performance Trend: ${trendIcon} ${suiteMetrics.performanceTrends.trend}`);

    if (suiteMetrics.slowestTests.length > 0) {
      console.log(`\n🐌 Slowest Tests:`);
      suiteMetrics.slowestTests.slice(0, 3).forEach(test => {
        console.log(`  • ${test.testName} (${test.duration}ms)`);
      });
    }

    if (suiteMetrics.failedTests.length > 0) {
      console.log(`\n❌ Failed Tests:`);
      suiteMetrics.failedTests.forEach(test => {
        console.log(`  • ${test.testName}: ${test.error || 'Unknown error'}`);
      });
    }

    console.log(`\n🌐 Browser Coverage:`);
    Object.entries(suiteMetrics.browserBreakdown).forEach(([browser, count]) => {
      console.log(`  • ${browser}: ${count} tests`);
    });

    console.log('\n' + '='.repeat(80));
  }

  private loadHistoricalData(): any[] {
    try {
      if (fs.existsSync(this.historicalDataPath)) {
        const data = fs.readFileSync(this.historicalDataPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Could not load historical data:', error.message);
    }
    return [];
  }

  private updateHistoricalData(suiteMetrics: TestSuiteMetrics): void {
    try {
      const historicalData = this.loadHistoricalData();
      
      historicalData.push({
        timestamp: new Date().toISOString(),
        performanceScore: suiteMetrics.performanceScore,
        totalTests: suiteMetrics.totalTests,
        passedTests: suiteMetrics.passedTests,
        failedTests: suiteMetrics.failedTests,
        totalDuration: suiteMetrics.totalDuration,
        averageTestDuration: suiteMetrics.averageTestDuration
      });

      // Keep only last 100 runs
      const trimmedData = historicalData.slice(-100);
      
      fs.writeFileSync(this.historicalDataPath, JSON.stringify(trimmedData, null, 2));
    } catch (error) {
      console.warn('Could not update historical data:', error.message);
    }
  }

  private calculateTrends(currentScore: number, historicalData: any[]): any {
    if (historicalData.length === 0) {
      return { currentRun: currentScore, trend: 'stable' };
    }

    const previousScore = historicalData[historicalData.length - 1]?.performanceScore || currentScore;
    const difference = currentScore - previousScore;
    
    let trend: 'improving' | 'degrading' | 'stable' = 'stable';
    if (difference > 5) {
      trend = 'improving';
    } else if (difference < -5) {
      trend = 'degrading';
    }

    return {
      currentRun: currentScore,
      previousRun: previousScore,
      trend
    };
  }
}

// Export for use in playwright.config.ts
export default PerformanceReporter;