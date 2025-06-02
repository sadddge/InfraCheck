import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import type { UsersService } from './users.service';
import type { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enums';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
@ApiBearerAuth()
@Controller({
    path: 'users',
    version: '1',
})
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Retrieve all users',
        description:
            'This endpoint retrieves a list of all users in the system. Only accessible by users with the ADMIN role.',
    })
    @ApiOkResponse({
        description: 'List of users retrieved successfully.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. You must be logged in to access this resource.',
    })
    @ApiForbiddenResponse({
        description: 'Forbidden. You do not have permission to access this resource.',
    })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
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
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch(':id')
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

    @Delete(':id')
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
