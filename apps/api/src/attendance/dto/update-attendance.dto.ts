import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  bookingId!: string;
}
