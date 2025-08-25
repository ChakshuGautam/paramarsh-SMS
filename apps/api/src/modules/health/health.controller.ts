import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async get() {
    try {
      // Test basic database connectivity
      await this.prisma.$queryRaw`SELECT 1 as test`;
      return { 
        status: 'ok', 
        ts: new Date().toISOString(),
        database: 'connected'
      };
    } catch (error) {
      return { 
        status: 'error', 
        ts: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      };
    }
  }

  @Get('database')
  async checkDatabase() {
    try {
      // Test database connection and basic schema access
      const result = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          tableowner,
          hasindexes,
          hasrules,
          hastriggers
        FROM pg_tables 
        WHERE schemaname = 'public'
        LIMIT 1
      `;
      
      return {
        status: 'ok',
        ts: new Date().toISOString(),
        database: 'connected',
        schema: 'accessible',
        sample: result
      };
    } catch (error) {
      return {
        status: 'error',
        ts: new Date().toISOString(),
        database: error.code === 'P1001' ? 'unreachable' : 'connected',
        schema: error.code === 'P1010' ? 'permission_denied' : 'unknown',
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  }
}
