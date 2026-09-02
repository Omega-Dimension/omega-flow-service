import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
 
export class PaymentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  invoice_id?: string;
 
  @IsOptional()
  @IsUUID()
  client_id?: string;
 
  @IsOptional()
  @IsString()
  status?: string;
}
 