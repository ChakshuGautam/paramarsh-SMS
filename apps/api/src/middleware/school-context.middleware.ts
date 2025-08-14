import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Middleware to set up school context from request headers
 * 
 * Accepts both X-School-Id (preferred) and X-Branch-Id (legacy) headers
 * Maps them to the internal branchId for database operations
 */
@Injectable()
export class SchoolContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract school ID from headers (supporting both naming conventions)
    const schoolId = req.headers['x-school-id'] as string || 
                    req.headers['x-branch-id'] as string;
    
    // Extract tenant ID if present
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (schoolId || tenantId) {
      // Run the request in the school/tenant scope
      PrismaService.runWithScope(
        { 
          branchId: schoolId,  // Map schoolId to internal branchId
          tenantId 
        },
        () => next()
      );
    } else {
      next();
    }
  }
}