import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

interface ExceptionMeta {
  description?: string;
  field?: string;
  code?: string;
}

function buildException(
  ExceptionClass: new (response: object) => Error,
  message: string,
  defaultCode: string,
  meta?: ExceptionMeta,
): never {
  throw new ExceptionClass({
    message,
    code: meta?.code ?? defaultCode,
    field: meta?.field ?? null,
    description: meta?.description ?? null,
  });
}

export const throwBadRequest    = (message: string, meta?: ExceptionMeta): never => buildException(BadRequestException,          message, 'BAD_REQUEST',           meta);
export const throwUnauthorized  = (message: string, meta?: ExceptionMeta): never => buildException(UnauthorizedException,        message, 'UNAUTHORIZED',          meta);
export const throwForbidden     = (message: string, meta?: ExceptionMeta): never => buildException(ForbiddenException,           message, 'FORBIDDEN',             meta);
export const throwNotFound      = (message: string, meta?: ExceptionMeta): never => buildException(NotFoundException,            message, 'NOT_FOUND',             meta);
export const throwConflict      = (message: string, meta?: ExceptionMeta): never => buildException(ConflictException,            message, 'CONFLICT',              meta);
export const throwGone          = (message: string, meta?: ExceptionMeta): never => buildException(GoneException,                message, 'GONE',                  meta);
export const throwUnprocessable = (message: string, meta?: ExceptionMeta): never => buildException(UnprocessableEntityException, message, 'UNPROCESSABLE_ENTITY',  meta);
export const throwInternalError = (message: string, meta?: ExceptionMeta): never => buildException(InternalServerErrorException, message, 'INTERNAL_SERVER_ERROR', meta);