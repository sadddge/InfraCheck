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
@ApiBearerAuth()
@Controller({
    path: 'users',
    version: '1',
})
export class UsersController {
    constructor(
        @Inject(USER_SERVICE)
        private readonly usersService: IUserService,
    ) {}

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
        return this.usersService.findAll(query.status);
    }

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
        return this.usersService.findById(+id);
    }

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
        return this.usersService.update(+id, updateUserDto);
    }

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
        return this.usersService.updateStatus(+id, updateUserStatusDto.status);
    }

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
