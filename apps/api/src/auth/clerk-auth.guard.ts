import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerkClient: ReturnType<typeof createClerkClient>;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    if (secretKey && secretKey !== 'sk_test_YOUR_SECRET_KEY') {
      this.clerkClient = createClerkClient({ secretKey });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // In development without Clerk configured, allow all requests
    if (!this.clerkClient) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      // Verify the JWT token with Clerk
      const verifyResult = await this.clerkClient.verifyToken(token);
      
      // Add user information to the request
      request.user = {
        id: verifyResult.sub,
        role: verifyResult.publicMetadata?.role || 'user',
        branchId: request.headers['x-branch-id'] || 'branch1',
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}