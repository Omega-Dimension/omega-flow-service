import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

interface ExceptionMeta {
  code?: string;
}

function buildException(
  ExceptionClass: new (response: object) => HttpException,
  message: string,
  defaultCode: string,
  meta?: ExceptionMeta,
): never {
  throw new ExceptionClass({
    message,
    code: meta?.code ?? defaultCode,
  });
}

function throwBadRequest(message: string, meta?: ExceptionMeta): never {
  return buildException(BadRequestException, message, 'BAD_REQUEST', meta);
}

function throwUnauthorized(message: string, meta?: ExceptionMeta): never {
  return buildException(UnauthorizedException, message, 'UNAUTHORIZED', meta);
}

function throwForbidden(message: string, meta?: ExceptionMeta): never {
  return buildException(ForbiddenException, message, 'FORBIDDEN', meta);
}

function throwNotFound(message: string, meta?: ExceptionMeta): never {
  return buildException(NotFoundException, message, 'NOT_FOUND', meta);
}

function throwConflict(message: string, meta?: ExceptionMeta): never {
  return buildException(ConflictException, message, 'CONFLICT', meta);
}

function throwGone(message: string, meta?: ExceptionMeta): never {
  return buildException(GoneException, message, 'GONE', meta);
}

function throwUnprocessable(message: string, meta?: ExceptionMeta): never {
  return buildException(
    UnprocessableEntityException,
    message,
    'UNPROCESSABLE_ENTITY',
    meta,
  );
}

function throwInternalError(message: string, meta?: ExceptionMeta): never {
  return buildException(
    InternalServerErrorException,
    message,
    'INTERNAL_SERVER_ERROR',
    meta,
  );
}

export {
  throwBadRequest,
  throwUnauthorized,
  throwForbidden,
  throwNotFound,
  throwConflict,
  throwGone,
  throwUnprocessable,
  throwInternalError,
};
