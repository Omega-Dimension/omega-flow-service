import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ClientProfileQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  country?: string;
}