import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Role } from '../shared/role.enum';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(bookingId: string, role: Role) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        child: {
          include: {
            guardians: {
              include: { guardian: true }
            }
          }
        },
        slot: true
      }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const attendance = await this.prisma.attendance.upsert({
      where: { bookingId },
      create: {
        bookingId,
        checkInAt: new Date()
      },
      update: {
        checkInAt: new Date()
      }
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'attendance.check-in',
        actorRole: role,
        details: {
          bookingId,
          attendanceId: attendance.id
        }
      }
    });

    return {
      id: attendance.id,
      bookingId: attendance.bookingId,
      checkInAt: attendance.checkInAt,
      checkOutAt: attendance.checkOutAt
    };
  }

  async checkOut(bookingId: string, role: Role) {
    const existing = await this.prisma.attendance.findUnique({ where: { bookingId } });
    if (!existing) {
      throw new BadRequestException('Check-in required before check-out');
    }

    const attendance = await this.prisma.attendance.update({
      where: { bookingId },
      data: {
        checkOutAt: new Date()
      }
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'attendance.check-out',
        actorRole: role,
        details: {
          bookingId,
          attendanceId: attendance.id
        }
      }
    });

    return {
      id: attendance.id,
      bookingId: attendance.bookingId,
      checkInAt: attendance.checkInAt,
      checkOutAt: attendance.checkOutAt
    };
  }
}
