import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

type JwtPayload = {
  sub?: string;
  roles?: string[];
  branchIds?: string[];
  branch_ids?: string[];
  [key: string]: any;
};

function parseJwt(token?: string): JwtPayload | undefined {
  if (!token) return undefined;
  const parts = token.split('.');
  if (parts.length < 2) return undefined;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8')) as JwtPayload;
    return payload;
  } catch {
    return undefined;
  }
}

@Injectable()
export class BranchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const path: string = req.path || '';
    // Allow public docs/health
    if (path.startsWith('/api-docs') || path.includes('/health')) {
      return true;
    }

    const authHeader: string | undefined = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;
    const payload = parseJwt(token) || {};
    const roles: string[] = Array.isArray(payload.roles) ? payload.roles : [];
    const allowedBranches: string[] = (payload.branchIds as string[]) || (payload.branch_ids as string[]) || [];

    const branchIdHeader: string | undefined = (req.headers['x-branch-id'] as string | undefined)?.trim();

    // Admin/super_admin/principal can access any branch
    if (roles.includes('admin') || roles.includes('super_admin') || roles.includes('principal')) {
      return true;
    }

    // If token carries allowed branches, enforce header must be present and included
    if (allowedBranches.length > 0) {
      if (!branchIdHeader) {
        throw new ForbiddenException('Branch selection required');
      }
      if (!allowedBranches.includes(branchIdHeader)) {
        throw new ForbiddenException('Forbidden for selected branch');
      }
      return true;
    }

    // No branch claim → allow (legacy/dev); downstream scoping may still apply
    return true;
  }
}
