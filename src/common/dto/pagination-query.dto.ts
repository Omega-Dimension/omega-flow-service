import { Type } from 'class-transformer';
import { IsIn, IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page_number: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  per_page: number = 10;

  @IsOptional()
  order_by?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order_type?: 'ASC' | 'DESC';
}
