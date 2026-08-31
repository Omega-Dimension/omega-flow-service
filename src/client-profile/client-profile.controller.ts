import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ClientProfileService } from './client-profile.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { ClientProfileQueryDto } from './dto/query.dto';
import { throwBadRequest } from '../libs/throwError';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';

/**
 * Client Profile Controller
 * ---------------------------------------------------
 * Handles all client profile related HTTP requests
 */

@Controller('client-profiles')
@UseGuards(JwtAuthGuard)
export class ClientProfileController {
  constructor(private readonly clientProfileService: ClientProfileService) {}

  /**
   * Create client profile
   * POST /client-profiles
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @GetUser() user: JwtUser,
    @Body() createClientProfileDto: CreateClientProfileDto,
  ) {
    return this.clientProfileService.create(user.id, createClientProfileDto);
  }

  /**
   * Get all client profiles
   * GET /client-profiles
   */
  @Get()
  findAll(@Query() query: ClientProfileQueryDto) {
    return this.clientProfileService.findAll(query);
  }

  /**
   * Get client profile by user
   * GET /client-profiles/user/:user_id
   */
  @Get('user/:user_id')
  findByUser(
    @Param(
      'user_id',
      new ParseUUIDPipe({
        exceptionFactory: () => throwBadRequest('User ID must be a valid UUID'),
      }),
    )
    user_id: string,
  ) {
    return this.clientProfileService.findByUser(user_id);
  }

  /**
   * Get single client profile
   * GET /client-profiles/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientProfileService.findOne(id);
  }

  /**
   * Update client profile
   * PATCH /client-profiles/:id
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClientProfileDto: UpdateClientProfileDto,
  ) {
    return this.clientProfileService.update(id, updateClientProfileDto);
  }

  /**
   * Delete client profile
   * DELETE /client-profiles/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientProfileService.remove(id);
  }
}
