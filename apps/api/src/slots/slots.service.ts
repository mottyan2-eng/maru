import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDate(date: string) {
    const dayStart = this.parseDate(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const slots = await this.prisma.programSlot.findMany({
      where: {
        date: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      include: {
        bookings: {
          include: {
            child: {
              include: {
                guardians: {
                  include: {
                    guardian: true
                  }
                }
              }
            },
            attendance: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    return slots.map((slot) => ({
      id: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      bookings: slot.bookings.map((booking) => ({
        id: booking.id,
        childId: booking.childId,
        slotId: booking.slotId,
        status: booking.status,
        child: {
          id: booking.child.id,
          firstName: booking.child.firstName,
          lastName: booking.child.lastName,
          birthDate: booking.child.birthDate,
          createdAt: booking.child.createdAt,
          guardians: booking.child.guardians.map(({ guardian }) => ({
            id: guardian.id,
            name: guardian.name,
            email: guardian.email,
            phone: guardian.phone
          }))
        },
        attendance: booking.attendance
          ? {
              id: booking.attendance.id,
              bookingId: booking.attendance.bookingId,
              checkInAt: booking.attendance.checkInAt,
              checkOutAt: booking.attendance.checkOutAt
            }
          : null
      }))
    }));
  }

  private parseDate(value: string) {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    return parsed;
  }
}
