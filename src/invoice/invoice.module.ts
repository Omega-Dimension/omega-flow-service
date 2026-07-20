import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Client } from '../client/entities/client.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, Client])
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports : [InvoiceService]
})
export class InvoiceModule {}
