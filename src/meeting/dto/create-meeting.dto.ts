import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
export class CreateMeetingDto {
  @IsUUID()
  client_id: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsString()
  @Length(2, 200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  meeting_platform?: string;

  @IsOptional()
  @IsUrl()
  meeting_url?: string;

  @IsDateString()
  scheduled_at: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  duration_minutes?: number;

  @IsOptional()
  @IsIn(['scheduled', 'completed', 'cancelled'])
  status?: string;
}

export class CreateMeetingByFreelancerDto {
  @IsUUID()
  client_id: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsString()
  @Length(2, 200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  meeting_platform?: string;

  @IsOptional()
  @IsUrl()
  meeting_url?: string;

  @IsDateString()
  scheduled_at: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  duration_minutes?: number;
}

export class CreateMeetingByClientDto {
  @IsUUID()
  freelancer_id: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsString()
  @Length(2, 200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  meeting_platform?: string;

  @IsOptional()
  @IsUrl()
  meeting_url?: string;

  @IsDateString()
  scheduled_at: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  duration_minutes?: number;
}
