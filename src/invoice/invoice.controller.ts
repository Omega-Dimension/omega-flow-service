import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/query.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  /**
   * Create invoice
   * POST /invoices/:user_id
   */

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@GetUser() user: JwtUser, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(user.id, createInvoiceDto);
  }

  @Get()
  findAll(@GetUser() user: JwtUser, @Query() query: InvoiceQueryDto) {
    return this.invoiceService.findAll(user.id, query);
  }

  /**
   * Get single invoice
   * GET /invoices/:id
   */
  @Get(':id')
  findOne(@GetUser() user: JwtUser, @Param('id') id: string) {
    return this.invoiceService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @GetUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@GetUser() user: JwtUser, @Param('id') id: string) {
    return this.invoiceService.remove(user.id, id);
  }
}
