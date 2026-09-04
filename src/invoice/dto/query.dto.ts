import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { INVOICE_STATUS, type InvoiceStatus } from '../../libs/constants';

export class InvoiceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  client_id?: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsIn(Object.values(INVOICE_STATUS))
  status?: InvoiceStatus;
}
