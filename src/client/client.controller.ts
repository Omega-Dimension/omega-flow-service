import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';

/**
 * Client Controller
 * ---------------------------------------------------
 * Handles all HTTP requests related to clients
 *
 * Architecture:
 * Client → Controller → Service → Repository
 */

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(
    /**
     * Business logic layer
     */
    private readonly clientService: ClientService,
  ) {}

  /**
   * Create new client
   * POST /clients/:user_id
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@GetUser() user: JwtUser, @Body() createClientDto: CreateClientDto) {
    return this.clientService.create(user.id, createClientDto);
  }

  /**
   * Get all clients
   * GET /clients
   */
  @Get()
  findAll(@GetUser() user: JwtUser, @Query() query: PaginationQueryDto) {
    return this.clientService.findAll(user.id, query);
  }

  /**
   * Get single client
   * GET /clients/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  /**
   * Update client
   * PATCH /clients/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  /**
   * Soft delete client
   * DELETE /clients/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
