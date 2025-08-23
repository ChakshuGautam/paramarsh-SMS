import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkAuthGuard } from './clerk-auth.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ClerkAuthGuard],
  exports: [ClerkAuthGuard],
})
export class AuthModule {}