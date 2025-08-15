import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckInDto, CheckOutDto } from './dto/teacher-attendance.dto';

@Injectable()
export class TeacherAttendanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter?: any) {
    return this.prisma.teacherDailyAttendance.findMany({
      where: filter,
      include: {
        teacher: {
          include: {
            staff: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const attendance = await this.prisma.teacherDailyAttendance.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            staff: true,
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  async getTodayAttendance(teacherId: string, branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.teacherDailyAttendance.findFirst({
      where: {
        teacherId,
        branchId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        teacher: {
          include: {
            staff: true,
          },
        },
      },
    });
  }

  async checkIn(dto: CheckInDto, branchId?: string) {
    const { teacherId } = dto;

    // Check if already checked in today
    const existingAttendance = await this.getTodayAttendance(teacherId, branchId);
    if (existingAttendance) {
      throw new BadRequestException('Already checked in for today');
    }

    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Create attendance record
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.teacherDailyAttendance.create({
      data: {
        teacherId,
        branchId,
        date: today,
        checkIn: now,
        status: 'present',
      },
      include: {
        teacher: {
          include: {
            staff: true,
          },
        },
      },
    });
  }

  async checkOut(dto: CheckOutDto, branchId?: string) {
    const { teacherId } = dto;

    // Get today's attendance record
    const attendance = await this.getTodayAttendance(teacherId, branchId);
    
    if (!attendance) {
      throw new NotFoundException('No check-in found for today');
    }

    if (attendance.checkOut) {
      throw new BadRequestException('Already checked out for today');
    }

    // Calculate total hours
    const now = new Date();
    const checkInTime = new Date(attendance.checkIn!);
    const totalHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    return this.prisma.teacherDailyAttendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        totalHours,
        status: 'present',
      },
      include: {
        teacher: {
          include: {
            staff: true,
          },
        },
      },
    });
  }

  async markAbsent(teacherId: string, date: Date, branchId?: string) {
    // Check if attendance already exists
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const existing = await this.prisma.teacherDailyAttendance.findFirst({
      where: {
        teacherId,
        branchId,
        date: {
          gte: dateStart,
          lt: dateEnd,
        },
      },
    });

    if (existing) {
      return this.prisma.teacherDailyAttendance.update({
        where: { id: existing.id },
        data: { status: 'absent' },
      });
    }

    return this.prisma.teacherDailyAttendance.create({
      data: {
        teacherId,
        branchId,
        date: dateStart,
        status: 'absent',
      },
    });
  }

  async getAttendanceReport(teacherId: string, startDate: Date, endDate: Date, branchId?: string) {
    const attendance = await this.prisma.teacherDailyAttendance.findMany({
      where: {
        teacherId,
        branchId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate statistics
    const stats = {
      totalDays: 0,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalHours: 0,
      averageHours: 0,
    };

    attendance.forEach(record => {
      stats.totalDays++;
      if (record.status === 'present') stats.present++;
      else if (record.status === 'absent') stats.absent++;
      else if (record.status === 'late') stats.late++;
      else if (record.status === 'half-day') stats.halfDay++;
      
      if (record.totalHours) {
        stats.totalHours += record.totalHours;
      }
    });

    if (stats.present > 0) {
      stats.averageHours = stats.totalHours / stats.present;
    }

    return {
      attendance,
      stats,
    };
  }

  async bulkMarkAttendance(records: Array<{
    teacherId: string;
    date: Date;
    status: string;
    checkIn?: Date;
    checkOut?: Date;
  }>, branchId?: string) {
    const operations = records.map(record => {
      const dateStart = new Date(record.date);
      dateStart.setHours(0, 0, 0, 0);

      let totalHours = null;
      if (record.checkIn && record.checkOut) {
        totalHours = (new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60);
      }

      return this.prisma.teacherDailyAttendance.upsert({
        where: {
          teacherId_date: {
            teacherId: record.teacherId,
            date: dateStart,
          },
        },
        update: {
          status: record.status,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          totalHours,
        },
        create: {
          teacherId: record.teacherId,
          branchId,
          date: dateStart,
          status: record.status,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          totalHours,
        },
      });
    });

    return this.prisma.$transaction(operations);
  }

  async generateDummyAttendance(date: Date, branchId?: string) {
    // Get all active teachers for the branch
    const teachers = await this.prisma.teacher.findMany({
      where: {
        branchId,
        staff: {
          status: 'active',
        },
      },
      include: {
        staff: true,
      },
    });

    if (teachers.length === 0) {
      return { message: 'No active teachers found', generated: 0 };
    }

    // Check for existing attendance records for this date
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const existingRecords = await this.prisma.teacherDailyAttendance.findMany({
      where: {
        branchId,
        date: {
          gte: dateStart,
          lt: dateEnd,
        },
      },
      select: { teacherId: true },
    });

    const existingTeacherIds = new Set(existingRecords.map(r => r.teacherId));
    const teachersToProcess = teachers.filter(t => !existingTeacherIds.has(t.id));

    if (teachersToProcess.length === 0) {
      return {
        message: 'All teachers already have attendance records for this date',
        generated: 0,
        date: dateStart.toISOString().split('T')[0]
      };
    }

    // Generate realistic attendance data
    const attendanceRecords = teachersToProcess.map(teacher => {
      const random = Math.random() * 100;
      let status: string;
      let checkIn: Date | null = null;
      let checkOut: Date | null = null;
      let totalHours: number | null = null;

      if (random < 90) { // 90% present
        status = 'present';
        
        // Generate realistic check-in times (8:00 AM - 9:30 AM)
        const baseCheckIn = new Date(dateStart);
        baseCheckIn.setHours(8, 0, 0, 0);
        const checkInVariation = Math.random() * 90; // Up to 90 minutes variation
        checkIn = new Date(baseCheckIn.getTime() + checkInVariation * 60 * 1000);

        // If late (after 9:00 AM), mark as late
        if (checkIn.getHours() >= 9) {
          status = 'late';
        }

        // Generate check-out times (4:00 PM - 6:00 PM)
        const baseCheckOut = new Date(dateStart);
        baseCheckOut.setHours(16, 0, 0, 0);
        const checkOutVariation = Math.random() * 120; // Up to 120 minutes variation
        checkOut = new Date(baseCheckOut.getTime() + checkOutVariation * 60 * 1000);

        // Calculate total hours
        totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        
        // Ensure minimum 6 hours worked
        if (totalHours < 6) {
          const additionalTime = (6 - totalHours) * 60 * 60 * 1000;
          checkOut = new Date(checkOut.getTime() + additionalTime);
          totalHours = 6;
        }
      } else if (random < 95) { // 5% half-day
        status = 'half-day';
        
        // Half day - either morning or afternoon
        const isMorning = Math.random() < 0.5;
        if (isMorning) {
          // Morning half-day (8:00 AM - 12:00 PM)
          const baseCheckIn = new Date(dateStart);
          baseCheckIn.setHours(8, 0, 0, 0);
          checkIn = baseCheckIn;
          
          const baseCheckOut = new Date(dateStart);
          baseCheckOut.setHours(12, 0, 0, 0);
          checkOut = baseCheckOut;
        } else {
          // Afternoon half-day (1:00 PM - 5:00 PM)
          const baseCheckIn = new Date(dateStart);
          baseCheckIn.setHours(13, 0, 0, 0);
          checkIn = baseCheckIn;
          
          const baseCheckOut = new Date(dateStart);
          baseCheckOut.setHours(17, 0, 0, 0);
          checkOut = baseCheckOut;
        }
        
        totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      } else { // 5% absent
        status = 'absent';
      }

      return {
        teacherId: teacher.id,
        branchId,
        date: dateStart,
        status,
        checkIn,
        checkOut,
        totalHours,
      };
    });

    // Bulk insert attendance records
    const result = await this.prisma.teacherDailyAttendance.createMany({
      data: attendanceRecords,
    });

    // Calculate statistics
    const stats = {
      present: attendanceRecords.filter(r => r.status === 'present').length,
      late: attendanceRecords.filter(r => r.status === 'late').length,
      absent: attendanceRecords.filter(r => r.status === 'absent').length,
      halfDay: attendanceRecords.filter(r => r.status === 'half-day').length,
      totalHours: attendanceRecords
        .filter(r => r.totalHours !== null)
        .reduce((sum, r) => sum + (r.totalHours || 0), 0),
    };

    return {
      message: 'Teacher attendance dummy data generated successfully',
      date: dateStart.toISOString().split('T')[0],
      generated: result.count,
      skipped: existingTeacherIds.size,
      totalTeachers: teachers.length,
      statistics: stats,
    };
  }
}