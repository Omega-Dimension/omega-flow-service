export class PaginationDto<T> {
  data: T[];
  total: number;
  current_page: number;
  per_page: number;
}
