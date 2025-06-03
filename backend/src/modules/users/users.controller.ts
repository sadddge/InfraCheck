import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Inject,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enums';
import { UserAccessGuard } from 'src/common/guards/user-access.guard';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserDto } from './dto/user.dto';
import { IUserService, USER_SERVICE } from './interfaces/user-service.interface';

/**
 * User management controller providing RESTful endpoints for user operations.
 * Implements role-based access control and user-specific access restrictions.
 * Exposes user management endpoints including user listing (admin only),
 * user profile retrieval, user profile updates, user status management (admin only),
 * and user account deletion. All endpoints require authentication via Bearer token.
 *
 * @example
 * ```typescript
 * // All endpoints are prefixed with /api/v1/users
 * GET /api/v1/users              // List all users (admin only)
 * GET /api/v1/users/:id          // Get user by ID
 * PATCH /api/v1/users/:id        // Update user profile
 * PATCH /api/v1/users/:id/status // Update user status (admin only)
 * DELETE /api/v1/users/:id       // Delete user account
 * ```
 */
@ApiBearerAuth()
@Controller({
    path: 'users',
    version: '1',
})
export class UsersController {    /**
     * Creates a new UsersController instance.
     *
     * @param usersService User service for handling business logic
     */
    constructor(
        @Inject(USER_SERVICE)
        private readonly usersService: IUserService,
    ) {}    /**
     * Retrieves a list of all users in the system.
     * Only accessible by users with ADMIN role. Supports optional status filtering.
     * Returns user data without sensitive information like passwords.
     *
     * @param query Query parameters for filtering users by status
     * @returns Array of user DTOs without sensitive data
     *
     * @example
     * ```typescript
     * // Get all active users
     * GET /api/v1/users?status=ACTIVE
     * Authorization: Bearer <admin-token>
     * 
     * // Get all users regardless of status
     * GET /api/v1/users
     * Authorization: Bearer <admin-token>
     * ```
     */
    @Get()
    @HttpCode(200)
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Retrieve all users',
        description:
            'This endpoint retrieves a list of all users in the system. Only accessible by users with the ADMIN role.',
    })
    @ApiOkResponse({
        description: 'List of users retrieved successfully.',
        type: UserDto,
        isArray: true,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. You must be logged in to access this resource.',
    })
    @ApiForbiddenResponse({
        description: 'Forbidden. You do not have permission to access this resource.',
    })
    async findAll(@Query() query: UserQueryDto): Promise<UserDto[]> {
        return this.usersService.findAll(query.status);    }

    /**
     * Retrieves a specific user by their unique identifier.
     * Accessible by admins or the user themselves (enforced by UserAccessGuard).
     * Returns user data without sensitive information like passwords.
     *
     * @param id The unique identifier of the user to retrieve (URL parameter)
     * @returns User DTO without sensitive data
     *
     * @example
     * ```typescript
     * // Get user by ID
     * GET /api/v1/users/123
     * Authorization: Bearer <token>
     * ```
     */
    @Get(':id')
    @HttpCode(200)
    @UseGuards(UserAccessGuard)
    @ApiOperation({
        summary: 'Retrieve a user by ID',
        description:
            'This endpoint retrieves a user by their unique ID. Accessible by users with the ADMIN role.',
    })
    @ApiParam({
        name: 'id',
        description: 'The unique identifier of the user to retrieve.',
        type: Number,
        required: true,
    })
    @ApiOkResponse({
        description: 'User retrieved successfully.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. You must be logged in to access this resource.',
    })
    @ApiForbiddenResponse({
        description: 'Forbidden. You do not have permission to access this resource.',
    })
    @ApiNotFoundResponse({
        description: 'User not found. The user with the specified ID does not exist.',
    })
    findOne(@Param('id') id: string): Promise<UserDto> {
        return this.usersService.findById(+id);    }

    /**
     * Updates an existing user's profile information.
     * Accessible by admins or the user themselves (enforced by UserAccessGuard).
     * Supports partial updates - only provided fields will be modified.
     *
     * @param id The unique identifier of the user to update (URL parameter)
     * @param updateUserDto DTO containing the fields to update
     * @returns Updated user DTO without sensitive data
     *
     * @example
     * ```typescript
     * // Update user profile
     * PATCH /api/v1/users/123
     * Authorization: Bearer <token>
     * Content-Type: application/json
     * 
     * {
     *   "name": "Updated Name",
     *   "lastName": "Updated LastName"
     * }
     * ```
     */
    @Patch(':id')
    @HttpCode(200)
    @UseGuards(UserAccessGuard)
    @ApiOperation({
        summary: 'Update a user by ID',
        description:
            'This endpoint updates a user by their unique ID. Accessible by users with the ADMIN role.',
    })
    @ApiParam({
        name: 'id',
        description: 'The unique identifier of the user to update.',
        type: Number,
        required: true,
    })
    @ApiOkResponse({
        description: 'User updated successfully.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. You must be logged in to access this resource.',
    })
    @ApiForbiddenResponse({
        description: 'Forbidden. You do not have permission to access this resource.',
    })
    @ApiNotFoundResponse({
        description: 'User not found. The user with the specified ID does not exist.',
    })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);    }

    /**
     * Updates a user's account status (administrative operation).
     * Only accessible by users with ADMIN role. Used for account management
     * such as activating, suspending, or setting accounts to pending status.
     *
     * @param id The unique identifier of the user whose status is to be updated
     * @param updateUserStatusDto DTO containing the new status to assign
     * @returns Updated user DTO with new status
     *
     * @example
     * ```typescript
     * // Suspend a user account
     * PATCH /api/v1/users/123/status
     * Authorization: Bearer <admin-token>
     * Content-Type: application/json
     * 
     * {
     *   "status": "SUSPENDED"
     * }
     * 
     * // Reactivate a user account
     * {
     *   "status": "ACTIVE"
     * }
     * ```
     */
    @Patch(':id/status')
    @HttpCode(200)
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Update user status by ID',
        description:
            'This endpoint updates the status of a user by their unique ID. Accessible by users with the ADMIN role.',
    })
    @ApiParam({
        name: 'id',
        description: 'The unique identifier of the user whose status is to be updated.',
        type: Number,
        required: true,
    })
    @ApiOkResponse({
        description: 'User status updated successfully.',
        type: UserDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. You must be logged in to access this resource.',
    })
    @ApiForbiddenResponse({
        description: 'Forbidden. You do not have permission to access this resource.',
    })
    @ApiNotFoundResponse({
        description: 'User not found. The user with the specified ID does not exist.',
    })
    updateStatus(@Param('id') id: string, @Body() updateUserStatusDto: UpdateUserStatusDto) {
        return this.usersService.updateStatus(+id, updateUserStatusDto.status);    }

    /**
     * Permanently removes a user from the system.
     * Accessible by admins or the user themselves (enforced by UserAccessGuard).
     * This operation performs a hard delete and is irreversible.
     * Returns HTTP 202 (Accepted) to indicate the deletion request has been processed.
     *
     * @param id The unique identifier of the user to delete (URL parameter)
     * @returns Promise that resolves when deletion is complete
     *
     * @example
     * ```typescript
     * // Delete user account
     * DELETE /api/v1/users/123
     * Authorization: Bearer <token>
     * 
     * // Response: 202 Accepted
     * ```
     */
    @Delete(':id')
    @HttpCode(202)
    @UseGuards(UserAccessGuard)
    @ApiOperation({
        summary: 'Delete a user by ID',
        description:
            'This endpoint deletes a user by their unique ID. Accessible by users with the ADMIN role.',
    })
    @ApiParam({
        name: 'id',
        description: 'The unique identifier of the user to delete.',
        type: Number,
        required: true,
    })
    @ApiOkResponse({
        description: 'User deleted successfully.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. You must be logged in to access this resource.',
    })
    @ApiForbiddenResponse({
        description: 'Forbidden. You do not have permission to access this resource.',
    })
    @ApiNotFoundResponse({
        description: 'User not found. The user with the specified ID does not exist.',
    })
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
