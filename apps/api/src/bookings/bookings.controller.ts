import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentRole } from '../shared/current-role.decorator';
import { Role } from '../shared/role.enum';
import { Roles } from '../shared/roles.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  create(@Body() createBookingDto: CreateBookingDto, @CurrentRole() role: Role) {
    return this.bookingsService.create(createBookingDto, role);
  }
}
