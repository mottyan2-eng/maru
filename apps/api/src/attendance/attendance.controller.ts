import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentRole } from '../shared/current-role.decorator';
import { Role } from '../shared/role.enum';
import { Roles } from '../shared/roles.decorator';
import { AttendanceService } from './attendance.service';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @Roles(Role.ADMIN, Role.STAFF)
  checkIn(@Body() payload: UpdateAttendanceDto, @CurrentRole() role: Role) {
    return this.attendanceService.checkIn(payload.bookingId, role);
  }

  @Post('check-out')
  @Roles(Role.ADMIN, Role.STAFF)
  checkOut(@Body() payload: UpdateAttendanceDto, @CurrentRole() role: Role) {
    return this.attendanceService.checkOut(payload.bookingId, role);
  }
}
