import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../common/pagination.dto';
import { PaginationQueryDto } from '../common/pagination-query.dto';

async function paginationHandler<T>(
  result: T[],
  total: number,
  current: number,
  limit: number,
): Promise<PaginationDto<T>> {
  return {
    data: result,
    total,
    current_page: current,
    per_page: limit,
  };
}

function queryHandler(query: PaginationQueryDto) {
  return {
    take: query.page_number,
    skip: (query.page_number - 1) * query.per_page,
  };
}

async function PasswordHash(password: string, salt: number) {
  return await bcrypt.hash(password, salt);
}

async function PasswordCheck(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export { paginationHandler, queryHandler, PasswordHash, PasswordCheck };
