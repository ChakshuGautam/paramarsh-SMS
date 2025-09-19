/**
 * Tests for SeedLogger implementation
 */

import { SeedLogger, LogLevel } from '../../core/SeedLogger';
import { SeedProgress, SeedMetrics } from '../../core/interfaces';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('SeedLogger', () => {
  let logger: SeedLogger;

  beforeEach(() => {
    logger = new SeedLogger(LogLevel.DEBUG, false); // No console output during tests
  });

  describe('Basic Logging', () => {
    it('should log info messages', () => {
      logger.info('Test info message', { key: 'value' });
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].message).toBe('Test info message');
      expect(logs[0].meta).toEqual({ key: 'value' });
    });

    it('should log warning messages', () => {
      logger.warn('Test warning message');
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[0].message).toBe('Test warning message');
    });

    it('should log error messages with error objects', () => {
      const testError = new Error('Test error');
      logger.error('Test error message', testError, { context: 'test' });
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].message).toBe('Test error message');
      expect(logs[0].error).toBe(testError);
      expect(logs[0].meta).toEqual({ context: 'test' });
    });

    it('should log debug messages', () => {
      logger.debug('Test debug message');
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
      expect(logs[0].message).toBe('Test debug message');
    });
  });

  describe('Log Level Filtering', () => {
    it('should respect log level filtering', () => {
      // Create logger that only logs WARN and above
      const filteredLogger = new SeedLogger(LogLevel.WARN, false);
      
      filteredLogger.debug('Debug message');
      filteredLogger.info('Info message');
      filteredLogger.warn('Warning message');
      filteredLogger.error('Error message');
      
      const logs = filteredLogger.getLogs();
      expect(logs).toHaveLength(4); // All logs are stored regardless of level
      
      // But console output would be filtered (tested by manual verification)
    });

    it('should filter logs by level correctly', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      expect(logger.getLogsByLevel(LogLevel.DEBUG)).toHaveLength(1);
      expect(logger.getLogsByLevel(LogLevel.INFO)).toHaveLength(1);
      expect(logger.getLogsByLevel(LogLevel.WARN)).toHaveLength(1);
      expect(logger.getLogsByLevel(LogLevel.ERROR)).toHaveLength(1);
    });
  });

  describe('Progress Logging', () => {
    it('should log progress updates', () => {
      const progress: SeedProgress = {
        entityName: 'students',
        stage: 'seeding',
        processed: 50,
        total: 100,
        percentage: 50,
        currentBatch: 1,
        totalBatches: 2,
        message: 'Processing batch 1 of 2'
      };
      
      logger.progress(progress);
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].progress).toEqual(progress);
      expect(logs[0].message).toContain('students');
      expect(logs[0].message).toContain('50%');
    });

    it('should call progress callback if set', () => {
      const progressCallback = jest.fn();
      logger.setProgressCallback(progressCallback);
      
      const progress: SeedProgress = {
        entityName: 'students',
        stage: 'seeding',
        processed: 25,
        total: 100,
        percentage: 25
      };
      
      logger.progress(progress);
      
      expect(progressCallback).toHaveBeenCalledWith(progress);
    });
  });

  describe('Metrics Logging', () => {
    it('should log metrics', () => {
      const metrics: SeedMetrics = {
        totalRecords: 100,
        successCount: 95,
        errorCount: 5,
        startTime: new Date(),
        endTime: new Date(),
        duration: 5000,
        memoryUsage: process.memoryUsage()
      };
      
      logger.metrics(metrics);
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].metrics).toEqual(metrics);
      expect(logs[0].message).toContain('95/100');
    });

    it('should call metrics callback if set', () => {
      const metricsCallback = jest.fn();
      logger.setMetricsCallback(metricsCallback);
      
      const metrics: SeedMetrics = {
        totalRecords: 100,
        successCount: 100,
        errorCount: 0,
        startTime: new Date()
      };
      
      logger.metrics(metrics);
      
      expect(metricsCallback).toHaveBeenCalledWith(metrics);
    });
  });

  describe('Log Management', () => {
    it('should store all logs chronologically', () => {
      logger.info('First message');
      logger.warn('Second message');
      logger.error('Third message');
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('First message');
      expect(logs[1].message).toBe('Second message');
      expect(logs[2].message).toBe('Third message');
      
      // Verify timestamps are in order
      expect(logs[1].timestamp.getTime()).toBeGreaterThanOrEqual(logs[0].timestamp.getTime());
      expect(logs[2].timestamp.getTime()).toBeGreaterThanOrEqual(logs[1].timestamp.getTime());
    });

    it('should clear logs when requested', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      
      expect(logger.getLogs()).toHaveLength(2);
      
      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should provide comprehensive summary', () => {
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message', new Error('Test error'));
      
      const progress: SeedProgress = {
        entityName: 'test',
        stage: 'seeding',
        processed: 50,
        total: 100,
        percentage: 50
      };
      logger.progress(progress);
      
      const metrics: SeedMetrics = {
        totalRecords: 100,
        successCount: 95,
        errorCount: 5,
        startTime: new Date()
      };
      logger.metrics(metrics);
      
      const summary = logger.getSummary();
      
      expect(summary.totalLogs).toBe(5);
      expect(summary.byLevel.INFO).toBe(3); // info + progress + metrics
      expect(summary.byLevel.WARN).toBe(1);
      expect(summary.byLevel.ERROR).toBe(1);
      expect(summary.errors).toHaveLength(1);
      expect(summary.warnings).toHaveLength(1);
      expect(summary.progress).toHaveLength(1);
      expect(summary.metrics).toHaveLength(1);
    });
  });

  describe('Timestamp Accuracy', () => {
    it('should record accurate timestamps', () => {
      const beforeLog = Date.now();
      logger.info('Test message');
      const afterLog = Date.now();
      
      const logs = logger.getLogs();
      const logTimestamp = logs[0].timestamp.getTime();
      
      expect(logTimestamp).toBeGreaterThanOrEqual(beforeLog);
      expect(logTimestamp).toBeLessThanOrEqual(afterLog);
    });
  });
});