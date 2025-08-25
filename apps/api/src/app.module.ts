import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { StudentsModule } from './modules/students/students.module';
import { SectionsModule } from './modules/sections/sections.module';
import { ClassesModule } from './modules/classes/classes.module';
import { GuardiansModule } from './modules/guardians/guardians.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExamsModule } from './modules/exams/exams.module';
import { ApplicationsModule } from './modules/admissions/applications.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { MarksModule } from './modules/marks/marks.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { FeeStructuresModule } from './modules/fee-structures/fee-structures.module';
import { StaffModule } from './modules/staff/staff.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { FilesModule } from './modules/files/files.module';
import { FeeSchedulesModule } from './modules/fee-schedules/fee-schedules.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { AttendanceSessionsModule } from './modules/attendance-sessions/attendance-sessions.module';
import { TeacherAttendanceModule } from './modules/teacher-attendance/teacher-attendance.module';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { ProblemJsonFilter } from './common/problem.filter';
import { BranchGuard } from './common/guards/branch.guard';
import { ClerkAuthGuard } from './auth/clerk-auth.guard';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { RequestLoggingMiddleware } from './common/request-logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
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
    TeachersModule,
    FilesModule,
    FeeSchedulesModule,
    CommunicationsModule,
    TimetableModule,
    AttendanceSessionsModule,
    TeacherAttendanceModule,
    AcademicYearsModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    { provide: APP_FILTER, useClass: ProblemJsonFilter },
    { provide: APP_GUARD, useClass: ClerkAuthGuard },
    { provide: APP_GUARD, useClass: BranchGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
