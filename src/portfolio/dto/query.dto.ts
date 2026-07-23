import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class PortfolioQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;
}