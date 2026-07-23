import { IsBooleanString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class FreelancerProfileQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsBooleanString()
  is_public?: string;
}