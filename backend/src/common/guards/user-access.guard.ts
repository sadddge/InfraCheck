import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class UserAccessGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const userId = request.params.id;
        if (!user || !userId) {
            return false; // No user or userId provided
        }
        if (user.role === 'ADMIN') {
            return true; // Admins can access any user's data
        }
        return String(user.id) === String(userId); // Users can only access their own data
    }
}
