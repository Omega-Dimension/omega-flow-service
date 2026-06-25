import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTimelogDto {
  @IsUUID()
  project_id: string;

  @IsNumber()
  @Min(0.25)
  hours: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  log_date: Date;
}
