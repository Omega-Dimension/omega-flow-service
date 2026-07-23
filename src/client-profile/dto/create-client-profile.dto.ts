import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateClientProfileDto {
  @IsString()
  @Length(2, 150)
  name: string;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  @Length(6, 30)
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  country?: string;
}