import { IsIn, IsOptional, IsUUID } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class MeetingQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsUUID()
    client_id?: string;

    @IsOptional()
    @IsUUID()
    project_id?: string;

    @IsOptional()
    @IsIn(['scheduled', 'completed', 'cancelled'])
    status?: string;
}