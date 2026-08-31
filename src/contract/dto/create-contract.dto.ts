import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreateContractDto {
  @IsUUID()
  client_id: string;

  @IsUUID()
  project_id: string;

  @IsString()
  @Length(2, 200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @Length(3, 10)
  currency?: string;

  @IsDateString()
  start_date: Date;

  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @IsOptional()
  @IsIn(['draft', 'active', 'completed', 'terminated'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  client_signed?: boolean;

  @IsOptional()
  @IsBoolean()
  freelancer_signed?: boolean;

  @IsOptional()
  @IsString()
  contract_file?: string;
}
