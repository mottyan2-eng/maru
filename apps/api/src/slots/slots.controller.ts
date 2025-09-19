import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../shared/role.enum';
import { Roles } from '../shared/roles.decorator';
import { GetSlotsDto } from './dto/get-slots.dto';
import { SlotsService } from './slots.service';

@ApiTags('Program slots')
@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.STAFF, Role.VIEWER)
  findByDate(@Query() query: GetSlotsDto) {
    return this.slotsService.findByDate(query.date);
  }
}
