import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    // Extract request metadata
    const {
      method,
      url,
      body,
      params,
      headers,
      ip,
      user,
    } = request;

    // Get branch ID from headers
    const branchId = headers['x-branch-id'] || null;

    // Determine entity type and ID from URL
    const urlParts = url.split('/').filter(Boolean);
    const entityType = this.extractEntityType(urlParts);
    const entityId = params.id || this.extractEntityId(urlParts);

    // Determine action based on method and URL
    const action = this.determineAction(method, url);

    // Store old data for updates/deletes
    let oldData: any = null;

    // For updates and deletes, fetch current data
    if ((method === 'PUT' || method === 'PATCH' || method === 'DELETE') && entityId && entityType) {
      this.getOldData(entityType, entityId).then(data => {
        oldData = data;
      }).catch(() => {
        // Ignore errors fetching old data
      });
    }

    return next.handle().pipe(
      tap(async (responseData) => {
        const duration = Date.now() - startTime;

        // Don't log GET requests or health checks
        if (method === 'GET' || url.includes('/health')) {
          return;
        }

        // Create audit log entry
        try {
          await this.prisma.auditLog.create({
            data: {
              branchId,
              userId: user?.id || null,
              userEmail: user?.email || null,
              action,
              method,
              endpoint: url,
              entityType,
              entityId: entityId || responseData?.data?.id || null,
              oldData: oldData ? JSON.stringify(oldData) : null,
              newData: responseData?.data ? JSON.stringify(responseData.data) : null,
              ipAddress: ip || request.connection?.remoteAddress || null,
              userAgent: headers['user-agent'] || null,
              statusCode: response.statusCode,
              duration,
            },
          });
        } catch (error) {
          // Log error but don't fail the request
          console.error('Failed to create audit log:', error);
        }
      }),
      catchError(async (error) => {
        const duration = Date.now() - startTime;

        // Log failed requests
        try {
          await this.prisma.auditLog.create({
            data: {
              branchId,
              userId: user?.id || null,
              userEmail: user?.email || null,
              action,
              method,
              endpoint: url,
              entityType,
              entityId,
              oldData: oldData ? JSON.stringify(oldData) : null,
              newData: body ? JSON.stringify(body) : null,
              ipAddress: ip || request.connection?.remoteAddress || null,
              userAgent: headers['user-agent'] || null,
              statusCode: error.status || 500,
              errorMessage: error.message || 'Unknown error',
              duration,
            },
          });
        } catch (logError) {
          console.error('Failed to create error audit log:', logError);
        }

        // Re-throw the original error
        throw error;
      }),
    );
  }

  private determineAction(method: string, url: string): string {
    if (url.includes('/restore')) return 'RESTORE';
    if (url.includes('/login')) return 'LOGIN';
    if (url.includes('/logout')) return 'LOGOUT';
    
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return method;
    }
  }

  private extractEntityType(urlParts: string[]): string | null {
    // Common API patterns
    const apiIndex = urlParts.findIndex(part => part === 'api' || part === 'v1');
    if (apiIndex !== -1 && urlParts[apiIndex + 1]) {
      return urlParts[apiIndex + 1];
    }

    // Fallback to first non-api part
    const entityPart = urlParts.find(part => 
      !['api', 'v1', 'v2'].includes(part) && 
      !part.match(/^[0-9a-f-]+$/) // Not a UUID
    );
    
    return entityPart || null;
  }

  private extractEntityId(urlParts: string[]): string | null {
    // Look for UUID pattern
    const uuid = urlParts.find(part => 
      part.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    );
    
    return uuid || null;
  }

  private async getOldData(entityType: string, entityId: string): Promise<any> {
    try {
      // Map entity type to Prisma model name
      const modelName = this.mapToModelName(entityType);
      if (!modelName) return null;

      const model = (this.prisma as any)[modelName];
      if (!model) return null;

      const data = await model.findUnique({
        where: { id: entityId },
      });

      return data;
    } catch (error) {
      console.error('Error fetching old data:', error);
      return null;
    }
  }

  private mapToModelName(entityType: string): string | null {
    // Map plural API endpoints to singular model names
    const mappings: Record<string, string> = {
      'students': 'student',
      'guardians': 'guardian',
      'teachers': 'teacher',
      'staff': 'staff',
      'classes': 'class',
      'sections': 'section',
      'invoices': 'invoice',
      'payments': 'payment',
      'enrollments': 'enrollment',
      'exams': 'exam',
      'marks': 'mark',
      'attendance': 'attendanceRecord',
      'attendance-sessions': 'attendanceSession',
      'academic-years': 'academicYear',
      'fee-schedules': 'feeSchedule',
      'fee-structures': 'feeStructure',
      'applications': 'application',
      'templates': 'template',
      'campaigns': 'campaign',
      'tickets': 'ticket',
      'messages': 'message',
      'subjects': 'subject',
      'rooms': 'room',
      'timetable': 'timetablePeriod',
      'timeslots': 'timeSlot',
    };

    return mappings[entityType] || entityType;
  }
}