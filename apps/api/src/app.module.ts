import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { StudentsModule } from './modules/students/students.module';
import { SectionsModule } from './modules/sections/sections.module';
import { APP_FILTER } from '@nestjs/core';
import { ProblemJsonFilter } from './common/problem.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    TenantsModule,
    StudentsModule,
    SectionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: ProblemJsonFilter },
  ],
})
export class AppModule {}
