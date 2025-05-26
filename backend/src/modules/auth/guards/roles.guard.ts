import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from 'src/common/enums/roles.enums';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        this.logger.debug(`requiredRoles: ${requiredRoles}`);
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (user.role === Role.ADMIN) {
            return true;
        }
        return requiredRoles.some(role => user.role?.includes(role));
    }
}
