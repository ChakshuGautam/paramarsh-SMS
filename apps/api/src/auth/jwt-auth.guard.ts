import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // For now, allow all requests in development
    // In production, this should properly validate JWT tokens
    return true;
  }
}