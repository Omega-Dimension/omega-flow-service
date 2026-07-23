import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreatePortfolioDto {
  @IsString()
  @Length(2, 200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsUrl()
  project_url?: string;

  @IsOptional()
  @IsUrl()
  github_url?: string;

  @IsOptional()
  @IsString()
  technologies?: string;
}