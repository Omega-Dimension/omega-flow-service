import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateFreelancerProfileDto {
  @IsOptional()
  @IsString()
  profile_image?: string;

  @IsOptional()
  @IsString()
  @Length(0, 150)
  headline?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsUrl()
  linkedin_url?: string;

  @IsOptional()
  @IsUrl()
  github_url?: string;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  company_address?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  @Length(3, 10)
  default_currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  default_tax_percent?: number;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}
