import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentRole } from '../shared/current-role.decorator';
import { Role } from '../shared/role.enum';
import { Roles } from '../shared/roles.decorator';
import { CreateChildDto } from './dto/create-child.dto';
import { ChildrenService } from './children.service';

@ApiTags('Children')
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get()
  @Roles(Role.ADMIN, Role.STAFF, Role.VIEWER)
  findAll() {
    return this.childrenService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  create(@Body() createChildDto: CreateChildDto, @CurrentRole() role: Role) {
    return this.childrenService.create(createChildDto, role);
  }
}
