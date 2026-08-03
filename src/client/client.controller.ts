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
  } from '@nestjs/common';

  import { ClientService } from './client.service';
  import { CreateClientDto } from './dto/create-client.dto';
  import { UpdateClientDto } from './dto/update-client.dto';
  import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

  /**
   * Client Controller
   * ---------------------------------------------------
   * Handles all HTTP requests related to clients
   *
   * Architecture:
   * Client → Controller → Service → Repository
   */

  @Controller('clients')
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
    @Post(':user_id')
    @HttpCode(HttpStatus.CREATED)
    create(
      @Param('user_id') user_id: string,
      @Body() createClientDto: CreateClientDto,
    ) {
      return this.clientService.create(user_id, createClientDto);
    }

    /**
     * Get all clients
     * GET /clients
     */
    @Get()
    findAll(@Query() query: PaginationQueryDto) {
      return this.clientService.findAll(query);
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
    update(
      @Param('id') id: string,
      @Body() updateClientDto: UpdateClientDto,
    ) {
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