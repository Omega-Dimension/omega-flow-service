import {
  IsBoolean,
  IsDateString,
  IsMilitaryTime,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTimelogDto {
  @IsUUID()
  project_id: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  log_date: Date;

  @IsOptional()
  @IsMilitaryTime()
  start_time?: string;

  @IsOptional()
  @IsMilitaryTime()
  end_time?: string;

  @IsNumber()
  @Min(0)
  hours: number;

  @IsOptional()
  @IsBoolean()
  is_billable?: boolean;
}
