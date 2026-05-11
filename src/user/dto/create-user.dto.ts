import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 50)
  password: string;

  @IsOptional()
  @IsString()
  @Length(2, 150)
  company_name?: string;

  @IsOptional()
  @IsString()
  company_address?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @Matches(/^[A-Z]{3}$/)
  default_currency?: string;
}
