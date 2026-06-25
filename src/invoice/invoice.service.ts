import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Repository } from 'typeorm';
import { Client } from '../client/entities/client.entity';
import { throwConflict, throwNotFound } from '../libs/throwError';
import { InvoiceQueryDto } from './dto/query.dto';
import {
  paginationHandler,
  paginationQueryHandler,
} from '../libs/globalFunctions';
import { InvoiceItem } from './entities/invoice-item.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}
  /**
   * Use Case: Create Invoice
   * - validate client
   * - create invoice
   * - create invoice items
   */
  async create(user_id: string, createInvoiceDto: CreateInvoiceDto) {
    const clientExists = await this.clientRepository.existsBy({
      id: createInvoiceDto.client_id,
    });
    if (!clientExists) throwNotFound('Client not found', { field: 'client_id' });

    const subTotal = createInvoiceDto.invoice_items.reduce(
      (acc, item) => acc + item.quantity * item.unit_price,
      0,
    );
    const taxPercent = 0;
    const taxAmount = subTotal * (taxPercent / 100);
    const total = subTotal + taxAmount;

    const invoiceItems = createInvoiceDto.invoice_items.map((i) => ({
      ...i,
      total: i.quantity * i.unit_price,
    }));

    return {
      success: !!(await this.invoiceRepository.save(
        this.invoiceRepository.create({
          user_id,
          ...createInvoiceDto,
          sub_total: subTotal,
          tax_percent: taxPercent,
          tax_amount: taxAmount,
          total,
          invoice_items: invoiceItems,
        }),
      )),
    };
  }

  async findAll(query: InvoiceQueryDto) {
    const { page_number, per_page, client_id, status } = query;
    const [data, total] = await this.invoiceRepository.findAndCount({
      where: {
        ...(client_id && { client_id }),
        ...(status && { status }),
      },

      relations: {
        client: true,
        project: true,
      },

      ...paginationQueryHandler(query),
      order: {
        created_at: 'DESC',
      },
    });
    return paginationHandler(data, total, page_number, per_page);
  }

  async findOne(id: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: { client: true, project: true, invoice_items: true },
    });
    if (!invoice) throwNotFound('Invoice not found', { field: id });

    return invoice;
  }

  /**
   * Use Case: Update Invoice
   * - verify invoice exists
   * - update invoice data
   */
  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    await this.findOne(id);

    const { affected } = await this.invoiceRepository.update(
      id,
      updateInvoiceDto,
    );

    if (!affected) throwConflict('Update failed', { field: id });
    return { success: true };
  }
   /**
   * Use Case: Delete Invoice
   * - delete invoice by id
   */
  async remove(id: string) {
    const { affected } = await this.invoiceRepository.softDelete(id);

    if (!affected) throwConflict('Delete failed', { field: id });

    return { success: true };
  }
}
