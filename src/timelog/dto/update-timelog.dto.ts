import { PartialType } from '@nestjs/mapped-types';
import { CreateTimelogDto } from './create-timelog.dto';

export class UpdateTimelogDto extends PartialType(CreateTimelogDto) {}
