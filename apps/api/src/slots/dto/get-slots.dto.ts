import { IsISO8601, IsNotEmpty } from 'class-validator';

export class GetSlotsDto {
  @IsISO8601()
  @IsNotEmpty()
  date!: string;
}
