import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { Role } from '../shared/role.enum';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, role: Role) {
    const slot = await this.prisma.programSlot.findUnique({
      where: { id: createBookingDto.slotId },
      include: {
        bookings: {
          where: {
            status: {
              not: BookingStatus.CANCELLED
            }
          }
        }
      }
    });

    if (!slot) {
      throw new NotFoundException('Program slot not found');
    }

    if (slot.bookings.length >= slot.capacity) {
      throw new BadRequestException('This slot is already at capacity');
    }

    const childExists = await this.prisma.child.findUnique({ where: { id: createBookingDto.childId } });
    if (!childExists) {
      throw new NotFoundException('Child not found');
    }

    const booking = await this.prisma.booking.create({
      data: {
        childId: createBookingDto.childId,
        slotId: createBookingDto.slotId,
        status: BookingStatus.CONFIRMED
      },
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
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'booking.create',
        actorRole: role,
        details: {
          bookingId: booking.id,
          slotId: booking.slotId,
          childId: booking.childId
        }
      }
    });

    return {
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
    };
  }
}
