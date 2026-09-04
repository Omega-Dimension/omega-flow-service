import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ReviewPaymentDto, ReviewAction } from './dto/review-payment.dto';
import { PaymentQueryDto } from './dto/query.dto';
import { Invoice } from '../invoice/entities/invoice.entity';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { ClientProfile } from '../client-profile/entities/client-profile.entity';
import { throwConflict, throwNotFound } from '../libs/throwError';
import { paginationHandler, paginationQueryHandler } from '../libs/globalFunctions';
import type { JwtUser } from '../libs/interfaces/jwt-user.interface';
import { INVOICE_STATUS } from '../libs/constants';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,

    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,
  ) {}

  /**
   * Use Case: Client submits a payment proof (KPay / Wave Pay / bank transfer screenshot)
   * - client must own the invoice via their CRM client record
   * - invoice must not already be paid
   * - invoice moves to `pending_confirmation` so both sides see it's awaiting review
   */
  async create(user_id: string, dto: CreatePaymentDto) {
    const clientProfile = await this.clientProfileRepository.findOne({
      where: { user_id },
    });
    if (!clientProfile) {
      throwNotFound('Client profile not found for this user');
    }

    const invoice = await this.invoiceRepository.findOne({
      where: { id: dto.invoice_id },
      relations: { client: true },
    });
    if (!invoice) throwNotFound('Invoice not found');

    if (invoice.client?.client_profile_id !== clientProfile.id) {
      throwConflict('You are not authorized to pay this invoice');
    }

    if (invoice.status === INVOICE_STATUS.PAID) {
      throwConflict('This invoice has already been paid');
    }

    if (invoice.status === INVOICE_STATUS.PENDING_CONFIRMATION) {
      throwConflict('A payment proof is already awaiting confirmation');
    }

    const payment = this.paymentRepository.create({
      invoice_id: invoice.id,
      freelancer_profile_id: invoice.freelancer_profile_id,
      client_id: invoice.client_id,
      amount: dto.amount,
      currency: dto.currency ?? invoice.currency ?? 'MMK',
      payment_method: dto.payment_method,
      transaction_reference: dto.transaction_reference,
      screenshot_url: dto.screenshot_url,
      submitted_by: user_id,
      status: PaymentStatus.PENDING,
    });

    const saved = await this.paymentRepository.save(payment);

    await this.invoiceRepository.update(invoice.id, {
      status: INVOICE_STATUS.PENDING_CONFIRMATION,
    });

    return { success: true, payment: saved };
  }

  /**
   * Use Case: List payments (paginated)
   * - freelancer sees payments against invoices they own
   * - client sees payments they submitted
   */
  async findAll(user: JwtUser, query: PaymentQueryDto) {
    const { page_number, per_page, invoice_id, client_id, status } = query;

    const [freelancerProfile, clientProfile] = await Promise.all([
      this.freelancerProfileRepository.findOne({ where: { user_id: user.id } }),
      this.clientProfileRepository.findOne({ where: { user_id: user.id } }),
    ]);

    const ownershipFilter: any[] = [];

    if (freelancerProfile) {
      ownershipFilter.push({
        freelancer_profile_id: freelancerProfile.id,
        ...(invoice_id && { invoice_id }),
        ...(client_id && { client_id }),
        ...(status && { status }),
      });
    }

    if (clientProfile) {
      ownershipFilter.push({
        client: { client_profile_id: clientProfile.id },
        ...(invoice_id && { invoice_id }),
        ...(status && { status }),
      });
    }

    if (ownershipFilter.length === 0) {
      return paginationHandler([], 0, page_number, per_page);
    }

    const [data, total] = await this.paymentRepository.findAndCount({
      where: ownershipFilter,
      relations: { invoice: true, client: true },
      ...paginationQueryHandler(query),
      order: { created_at: 'DESC' },
    });

    return paginationHandler(data, total, page_number, per_page);
  }

  /**
   * Use Case: Get a single payment with an authorization check
   */
  async findOne(id: string, user?: JwtUser) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: {
        invoice: true,
        client: true,
        freelancer_profile: { user: true },
      },
    });
    if (!payment) throwNotFound('Payment not found');

    if (user) {
      const [freelancerProfile, clientProfile] = await Promise.all([
        this.freelancerProfileRepository.findOne({
          where: { user_id: user.id },
        }),
        this.clientProfileRepository.findOne({ where: { user_id: user.id } }),
      ]);

      const isFreelancer =
        !!freelancerProfile &&
        payment.freelancer_profile_id === freelancerProfile.id;
      const isClient =
        !!clientProfile &&
        payment.client?.client_profile_id === clientProfile.id;

      if (!isFreelancer && !isClient) {
        throwConflict('You are not authorized to view this payment');
      }
    }

    return payment;
  }

  /**
   * Use Case: Freelancer reviews a payment proof
   * - confirm: payment -> confirmed, invoice -> paid (+ paid_at)
   * - reject: payment -> rejected with a reason, invoice reopens to `pending`
   *   so the client can resubmit a corrected screenshot
   */
  async review(id: string, user: JwtUser, dto: ReviewPaymentDto) {
    const payment = await this.findOne(id);

    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: { user_id: user.id },
    });

    if (
      !freelancerProfile ||
      payment.freelancer_profile_id !== freelancerProfile.id
    ) {
      throwConflict(
        'Only the freelancer on this invoice can review this payment',
      );
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throwConflict('This payment has already been reviewed');
    }

    if (dto.action === ReviewAction.REJECT && !dto.rejection_reason) {
      throwConflict('A rejection reason is required');
    }

    if (dto.action === ReviewAction.CONFIRM) {
      await this.paymentRepository.update(id, {
        status: PaymentStatus.CONFIRMED,
        reviewed_by: user.id,
        reviewed_at: new Date(),
      });

      await this.invoiceRepository.update(payment.invoice_id, {
        status: INVOICE_STATUS.PAID,
        paid_at: new Date(),
      });
    } else {
      await this.paymentRepository.update(id, {
        status: PaymentStatus.REJECTED,
        reviewed_by: user.id,
        reviewed_at: new Date(),
        rejection_reason: dto.rejection_reason,
      });

      await this.invoiceRepository.update(payment.invoice_id, {
        status: INVOICE_STATUS.PENDING,
      });
    }

    return { success: true };
  }

  /**
   * Use Case: Delete a payment record
   * - only while it's still pending (e.g. client uploaded the wrong screenshot)
   */
  async remove(id: string, user: JwtUser) {
    const payment = await this.findOne(id, user);

    if (payment.status !== PaymentStatus.PENDING) {
      throwConflict('Only a pending payment can be deleted');
    }

    const { affected } = await this.paymentRepository.delete(id);
    if (!affected) throwConflict('Delete failed');

    return { success: true };
  }
}