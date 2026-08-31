import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto {
  @IsUUID()
  client_id: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsIn(['draft', 'pending', 'paid', 'overdue'])
  status?: string;

  @IsOptional()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @IsOptional()
  @IsString()
  payment_terms?: string;

  @IsOptional()
  @IsDateString()
  due_date?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  invoice_items: CreateInvoiceItemDto[];
}
