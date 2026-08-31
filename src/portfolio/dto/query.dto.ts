import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class PortfolioQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  freelancer_profile_id?: string;
}
