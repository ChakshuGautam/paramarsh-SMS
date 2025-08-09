import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { StudentsModule } from './modules/students/students.module';
import { SectionsModule } from './modules/sections/sections.module';
import { ClassesModule } from './modules/classes/classes.module';
import { GuardiansModule } from './modules/guardians/guardians.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExamsModule } from './modules/exams/exams.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { MarksModule } from './modules/marks/marks.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { FeeStructuresModule } from './modules/fee-structures/fee-structures.module';
import { StaffModule } from './modules/staff/staff.module';
import { APP_FILTER } from '@nestjs/core';
import { ProblemJsonFilter } from './common/problem.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    TenantsModule,
    StudentsModule,
    SectionsModule,
    ClassesModule,
    GuardiansModule,
    InvoicesModule,
    PaymentsModule,
    ExamsModule,
    ApplicationsModule,
    EnrollmentsModule,
    MarksModule,
    AttendanceModule,
    FeeStructuresModule,
    StaffModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: ProblemJsonFilter },
  ],
})
export class AppModule {}
