import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ReviewAction {
  CONFIRM = 'confirm',
  REJECT = 'reject',
}

export class ReviewPaymentDto {
  @IsEnum(ReviewAction)
  action: ReviewAction;

  // Required in practice when action = 'reject'; validated in the service
  // rather than here so a single DTO can serve both actions.
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejection_reason?: string;
}