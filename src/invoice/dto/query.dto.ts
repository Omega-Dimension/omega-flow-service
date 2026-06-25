import { IsIn, IsOptional, IsUUID } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class InvoiceQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsUUID()
    client_id?: string;

    @IsOptional()
    @IsIn(['draft', 'pending', 'paid', 'overdue'])
    status?: string;
}