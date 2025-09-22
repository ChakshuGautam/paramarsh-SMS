/**
 * Enhanced logging system for Seed Data Manager v3.0
 * Following V3-IMPLEMENTATION-SPEC.md
 */

import { 
  SeedLogger as ISeedLogger, 
  SeedProgress, 
  SeedMetrics 
} from './interfaces';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  meta?: any;
  error?: Error;
  progress?: SeedProgress;
  metrics?: SeedMetrics;
}

export class SeedLogger implements ISeedLogger {
  private logs: LogEntry[] = [];
  private progressCallback?: (progress: SeedProgress) => void;
  private metricsCallback?: (metrics: SeedMetrics) => void;

  constructor(
    private readonly logLevel: LogLevel = LogLevel.INFO,
    private readonly enableConsole: boolean = true,
    private readonly enableFile: boolean = false,
    private readonly logFilePath?: string
  ) {}

  setProgressCallback(callback: (progress: SeedProgress) => void): void {
    this.progressCallback = callback;
  }

  setMetricsCallback(callback: (metrics: SeedMetrics) => void): void {
    this.metricsCallback = callback;
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, error?: Error, meta?: any): void {
    this.log(LogLevel.ERROR, message, meta, error);
  }

  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  progress(progress: SeedProgress): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: LogLevel.INFO,
      message: `[${progress.entityName}] ${progress.stage}: ${progress.percentage}%`,
      progress
    };

    this.logs.push(entry);
    
    if (this.enableConsole && this.logLevel <= LogLevel.INFO) {
      this.formatProgressConsole(progress);
    }

    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  metrics(metrics: SeedMetrics): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: LogLevel.INFO,
      message: `Metrics: ${metrics.successCount}/${metrics.totalRecords} records`,
      metrics
    };

    this.logs.push(entry);
    
    if (this.enableConsole && this.logLevel <= LogLevel.INFO) {
      this.formatMetricsConsole(metrics);
    }

    if (this.metricsCallback) {
      this.metricsCallback(metrics);
    }
  }

  private log(level: LogLevel, message: string, meta?: any, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      meta,
      error
    };

    this.logs.push(entry);

    if (this.enableConsole && this.logLevel <= level) {
      this.formatConsoleOutput(entry);
    }

    if (this.enableFile) {
      this.writeToFile(entry);
    }
  }

  private formatConsoleOutput(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelStr = LogLevel[entry.level].padEnd(5);
    const prefix = `[${timestamp}] ${levelStr}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${entry.message}`, entry.meta || '');
        break;
      case LogLevel.INFO:
        console.log(`${prefix} ${entry.message}`, entry.meta ? JSON.stringify(entry.meta, null, 2) : '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ⚠️  ${entry.message}`, entry.meta || '');
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ❌ ${entry.message}`, entry.error || '', entry.meta || '');
        if (entry.error?.stack) {
          console.error(entry.error.stack);
        }
        break;
    }
  }

  private formatProgressConsole(progress: SeedProgress): void {
    const percentage = progress.percentage.toString().padStart(3);
    const stage = progress.stage.padEnd(10);
    const bar = this.createProgressBar(progress.percentage);
    
    const batchInfo = progress.currentBatch && progress.totalBatches 
      ? ` [${progress.currentBatch}/${progress.totalBatches}]`
      : '';
    
    console.log(`🔄 ${progress.entityName.padEnd(15)} ${stage} ${bar} ${percentage}%${batchInfo}`);
    
    if (progress.message) {
      console.log(`   ${progress.message}`);
    }
  }

  private formatMetricsConsole(metrics: SeedMetrics): void {
    const duration = metrics.duration ? `${(metrics.duration / 1000).toFixed(2)}s` : 'N/A';
    const successRate = metrics.totalRecords > 0 
      ? `${((metrics.successCount / metrics.totalRecords) * 100).toFixed(1)}%`
      : '0%';
    
    console.log(`📊 Metrics: ${metrics.successCount}/${metrics.totalRecords} (${successRate}) in ${duration}`);
    
    if (metrics.errorCount > 0) {
      console.log(`   Errors: ${metrics.errorCount}`);
    }

    if (metrics.memoryUsage) {
      const memMB = (metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(1);
      console.log(`   Memory: ${memMB}MB`);
    }
  }

  private createProgressBar(percentage: number, width: number = 20): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.logFilePath) return;

    try {
      const fs = await import('fs/promises');
      const logLine = JSON.stringify({
        timestamp: entry.timestamp.toISOString(),
        level: LogLevel[entry.level],
        message: entry.message,
        meta: entry.meta,
        error: entry.error ? {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack
        } : undefined,
        progress: entry.progress,
        metrics: entry.metrics
      }) + '\n';

      await fs.appendFile(this.logFilePath, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(entry => entry.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }

  // Compatibility methods for orchestrator
  logProgress(entityName: string, stage: 'preparing' | 'validating' | 'seeding' | 'completed' | 'error', current: number, total: number): void {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    this.progress({
      entityName,
      stage,
      current,
      total,
      percentage
    });
  }

  logResult(result: any): void {
    if (result.metrics) {
      this.metrics(result.metrics);
    }
    this.info(`Completed: ${result.success ? 'Success' : 'Failed'}`, result);
  }

  logError(entityName: string, errors: string[]): void {
    errors.forEach(error => {
      this.error(`[${entityName}] ${error}`);
    });
  }

  getSummary(): {
    totalLogs: number;
    byLevel: Record<string, number>;
    errors: LogEntry[];
    warnings: LogEntry[];
    progress: SeedProgress[];
    metrics: SeedMetrics[];
  } {
    const byLevel: Record<string, number> = {};
    const errors: LogEntry[] = [];
    const warnings: LogEntry[] = [];
    const progress: SeedProgress[] = [];
    const metrics: SeedMetrics[] = [];

    for (const entry of this.logs) {
      const levelName = LogLevel[entry.level];
      byLevel[levelName] = (byLevel[levelName] || 0) + 1;

      if (entry.level === LogLevel.ERROR) {
        errors.push(entry);
      } else if (entry.level === LogLevel.WARN) {
        warnings.push(entry);
      }

      if (entry.progress) {
        progress.push(entry.progress);
      }

      if (entry.metrics) {
        metrics.push(entry.metrics);
      }
    }

    return {
      totalLogs: this.logs.length,
      byLevel,
      errors,
      warnings,
      progress,
      metrics
    };
  }
}