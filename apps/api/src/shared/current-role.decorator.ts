import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { Role } from './role.enum';

type RequestWithRole = Request & { role?: Role };

export const CurrentRole = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithRole>();
  return request.role ?? null;
});
