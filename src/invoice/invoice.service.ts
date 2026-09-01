import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { EntityManager, In, Repository } from 'typeorm';
import { Client } from '../client/entities/client.entity';
import { throwConflict, throwNotFound } from '../libs/throwError';
import { InvoiceQueryDto } from './dto/query.dto';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { FreelancerProfile } from '../freelancer-profile/entities/freelancer-profile.entity';
import { ClientProfile } from '../client-profile/entities/client-profile.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,

    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,

    private readonly dataSource: DataSource,
  ) {}
  /**
   * Use Case: Create Invoice
   * - validate client
   * - create invoice
   * - create invoice items
   */
  async create(user_id: string, createInvoiceDto: CreateInvoiceDto) {
    const { client_id, project_id, invoice_items, ...rest } = createInvoiceDto;

    return this.dataSource.transaction(async (manager) => {
      const freelancerProfile = await manager.findOne(FreelancerProfile, {
        where: { user_id },
        lock: { mode: 'pessimistic_write' }, // serializes concurrent create() calls for this freelancer
      });
      if (!freelancerProfile) throwNotFound('Freelancer profile not found');

      const client = await manager.findOne(Client, {
        where: { id: client_id, freelancer_profile_id: freelancerProfile.id },
      });
      if (!client) throwNotFound('Client not found');

      const invoice_number = await this.generateInvoiceNumber(
        manager,
        freelancerProfile.id,
      );

      const subTotal = invoice_items.reduce(
        (acc, i) => acc + i.quantity * i.unit_price,
        0,
      );
      const taxPercent = 0;
      const taxAmount = subTotal * (taxPercent / 100);

      const invoice = manager.create(Invoice, {
        ...rest,
        client_id,
        project_id,
        freelancer_profile_id: freelancerProfile.id,
        invoice_number,
        sub_total: subTotal,
        tax_percent: taxPercent,
        tax_amount: taxAmount,
        total: subTotal + taxAmount,
        invoice_items: invoice_items.map((item) => ({
          ...item,
          total: item.quantity * item.unit_price,
        })),
      });

      return { success: true, data: await manager.save(invoice) };
    });
  }

  private async generateInvoiceNumber(
    manager: EntityManager,
    freelancerProfileId: string,
  ) {
    const year = new Date().getFullYear();
    const count = await manager.count(Invoice, {
      where: { freelancer_profile_id: freelancerProfileId },
      withDeleted: true,
    });
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(user_id: string, query: InvoiceQueryDto) {
    const { page_number, per_page, client_id, project_id, status } = query;
    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: { user_id },
    });

    let where: any;
    if (freelancerProfile) {
      where = {
        freelancer_profile_id: freelancerProfile.id,
        ...(client_id && { client_id }),
        ...(project_id && { project_id }),
        ...(status && { status }),
      };
    } else {
      const clientProfile = await this.clientProfileRepository.findOne({
        where: { user_id },
      });
      if (!clientProfile) throwNotFound('Profile not found');

      const clients = await this.clientRepository.find({
        where: { client_profile_id: clientProfile.id },
      });
      where = {
        client_id: In(
          clients.length
            ? clients.map((c) => c.id)
            : ['00000000-0000-0000-0000-000000000000'],
        ),
        status: status ?? In(['pending', 'paid', 'overdue']), // drafts stay invisible to clients
        ...(project_id && { project_id }),
      };
    }

    const [data, total] = await this.invoiceRepository.findAndCount({
      where,
      relations: {
        freelancer_profile: true,
        client: true,
        project: true,
        invoice_items: true,
      },
      ...paginationQueryHandler(query),
      order: { created_at: 'DESC' },
    });
    return paginationHandler(data, total, page_number, per_page);
  }

  async findOne(user_id: string, id: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: { client: true, project: true, invoice_items: true },
    });
    if (!invoice) throwNotFound('Invoice not found');

    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: { user_id },
    });
    if (freelancerProfile) {
      if (invoice.freelancer_profile_id !== freelancerProfile.id)
        throwNotFound('Invoice not found');
      return invoice;
    }

    const clientProfile = await this.clientProfileRepository.findOne({
      where: { user_id },
    });
    const isOwner =
      clientProfile && invoice.client?.client_profile_id === clientProfile.id;
    if (!isOwner || invoice.status === 'draft')
      throwNotFound('Invoice not found');
    return invoice;
  }

  async update(
    user_id: string,
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ) {
    const { invoice_items, ...rest } = updateInvoiceDto;

    return this.dataSource.transaction(async (manager) => {
      const freelancerProfile = await manager.findOne(FreelancerProfile, {
        where: { user_id },
      });
      if (!freelancerProfile) throwNotFound('Freelancer profile not found');

      const invoice = await manager.findOne(Invoice, {
        where: { id, freelancer_profile_id: freelancerProfile.id },
      });
      if (!invoice) throwNotFound('Invoice not found');

      if (invoice_items) {
        await manager.delete('invoice_items', { invoice_id: id });

        const subTotal = invoice_items.reduce(
          (acc, i) => acc + i.quantity * i.unit_price,
          0,
        );
        const taxPercent = invoice.tax_percent;
        const taxAmount = subTotal * (taxPercent / 100);

        Object.assign(rest, {
          sub_total: subTotal,
          tax_amount: taxAmount,
          total: subTotal + taxAmount,
        });

        await manager.save(
          'invoice_items',
          invoice_items.map((item) => ({
            invoice_id: id,
            ...item,
            total: item.quantity * item.unit_price,
          })),
        );
      }

      await manager.update(Invoice, id, rest);
      return { success: true };
    });
  }

  async remove(user_id: string, id: string) {
    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: { user_id },
    });
    if (!freelancerProfile) throwNotFound('Freelancer profile not found');

    const { affected } = await this.invoiceRepository.softDelete({
      id,
      freelancer_profile_id: freelancerProfile.id,
    } as any);
    if (!affected) throwConflict('Delete failed');
    return { success: true };
  }
}
