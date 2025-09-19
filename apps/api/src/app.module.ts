import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AttendanceModule } from './attendance/attendance.module';
import { BookingsModule } from './bookings/bookings.module';
import { ChildrenModule } from './children/children.module';
import { DatabaseModule } from './database/database.module';
import { RolesGuard } from './shared/roles.guard';
import { SlotsModule } from './slots/slots.module';

@Module({
  imports: [DatabaseModule, ChildrenModule, SlotsModule, BookingsModule, AttendanceModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}
