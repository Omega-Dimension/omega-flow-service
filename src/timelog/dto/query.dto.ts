import { IsBooleanString, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class TimelogQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsBooleanString()
  is_billable?: string;
}
