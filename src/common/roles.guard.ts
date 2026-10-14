import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../users/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const request = context.switchToHttp().getRequest<{ user?: { role: Role } }>();
    if (!request.user || !roles.includes(request.user.role)) {
      throw new ForbiddenException('Anda tidak memiliki izin untuk operasi ini');
    }
    return true;
  }
}
