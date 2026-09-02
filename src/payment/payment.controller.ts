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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ReviewPaymentDto } from './dto/review-payment.dto';
import { PaymentQueryDto } from './dto/query.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';

/**
 * Payment Controller
 * ---------------------------------------------------
 * Manual payment proof flow for markets without a local payment-gateway API
 * (KPay, Wave Pay, bank transfer). Client uploads a screenshot -> freelancer
 * confirms or rejects -> invoice status updates accordingly.
 */
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Client submits payment proof for an invoice
   * POST /payments
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@GetUser() user: JwtUser, @Body() dto: CreatePaymentDto) {
    return this.paymentService.create(user.id, dto);
  }

  /**
   * List payments, scoped to the caller (freelancer or client)
   * GET /payments
   */
  @Get()
  findAll(@GetUser() user: JwtUser, @Query() query: PaymentQueryDto) {
    return this.paymentService.findAll(user, query);
  }

  /**
   * Get single payment
   * GET /payments/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: JwtUser) {
    return this.paymentService.findOne(id, user);
  }

  /**
   * Freelancer confirms or rejects a payment proof
   * PATCH /payments/:id/review
   */
  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @GetUser() user: JwtUser,
    @Body() dto: ReviewPaymentDto,
  ) {
    return this.paymentService.review(id, user, dto);
  }

  /**
   * Delete a pending payment (e.g. wrong screenshot uploaded)
   * DELETE /payments/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: JwtUser) {
    return this.paymentService.remove(id, user);
  }
}