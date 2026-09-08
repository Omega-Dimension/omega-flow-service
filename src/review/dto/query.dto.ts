import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ReviewerType } from '../../libs/constants';

export class ReviewQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  client_id?: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsUUID()
  freelancer_profile_id?: string;

  // Filters through the client -> client_profile relation, no join builder needed
  @IsOptional()
  @IsUUID()
  client_profile_id?: string;

  @IsOptional()
  @IsIn([ReviewerType.FREELANCER, ReviewerType.CLIENT])
  reviewer_type?: ReviewerType;
}