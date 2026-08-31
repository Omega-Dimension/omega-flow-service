import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

/**
 * Pagination response builder
 * ---------------------------------------------------
 * Standardizes API pagination response format.
 */
function paginationHandler<T>(
  result: T[],
  total: number,
  current: number,
  limit: number,
): PaginationDto<T> {
  return {
    data: result,
    total,
    current_page: current,
    per_page: limit,
  };
}

/**
 * Query handler for TypeORM pagination
 * ---------------------------------------------------
 * Converts page-based query into DB skip/take format.
 */
function paginationQueryHandler(query: PaginationQueryDto) {
  return {
    take: query.per_page,
    skip: (query.page_number - 1) * query.per_page,
  };
}

/**
 * Hash password using bcrypt
 * ---------------------------------------------------
 * Used during user registration and password updates.
 */
async function PasswordHash(password: string, salt: number) {
  return await bcrypt.hash(password, salt);
}

/**
 * Compare password with hashed value
 * ---------------------------------------------------
 * Used during login authentication.
 */
async function PasswordCheck(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export {
  paginationHandler,
  paginationQueryHandler,
  PasswordHash,
  PasswordCheck,
};
