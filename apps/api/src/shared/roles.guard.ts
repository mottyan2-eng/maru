import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';

type RequestWithRole = Request & { role?: Role };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    const request = context.switchToHttp().getRequest<RequestWithRole>();
    const header = request.headers['x-demo-role'];
    const roleValue = Array.isArray(header) ? header[0] : header;

    if (!roleValue) {
      throw new UnauthorizedException('x-demo-role header is required');
    }

    const normalizedRole = roleValue.toString().toUpperCase() as Role;

    if (!Object.values(Role).includes(normalizedRole)) {
      throw new ForbiddenException('Invalid role provided');
    }

    request.role = normalizedRole;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(normalizedRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
