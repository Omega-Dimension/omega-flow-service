import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';
import { UpdateDefaultWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * User Controller
 * ---------------------------------------------------
 * Handles HTTP requests for user-related operations.
 * Architecture:
 * Client → Controller → Service → Repository
 */

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    /**
     * Business logic layer (UserService)
     */
    private readonly userService: UserService,
  ) {}
  /**
   * Create new user
   * POST /users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  /**
   * Get all users (paginated)
   * GET /users
   */
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.userService.findAll(query);
  }
  /**
   * Get single user by ID
   * GET /users/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('default-workspace')
  updateDefaultWorkspace(
    @GetUser() user: JwtUser,
    @Body() dto: UpdateDefaultWorkspaceDto,
  ) {
    return this.userService.updateDefaultWorkspace(user.id, dto.workspace);
  }

  /**
   * Update user by ID
   * PATCH /users/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * Delete user by ID
   * DELETE /users/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
