import { HttpStatusCodes } from "../../typings/enums/http-codes";

interface ErrorCode {
  code: number;
}

class Exception extends Error implements ErrorCode {
  code: number;
  constructor(message: string) {
    super(message);
    this.code = HttpStatusCodes.SERVER_ERROR;
    this.name = "Exception";
  }
}

class ResourceExistsException extends Error implements ErrorCode {
  code: number;

  constructor(message: string) {
    super(message);
    this.name = "ResourceExistsException";
    this.code = HttpStatusCodes.ALREADY_EXISTS;
  }
}

class BadRequestException extends Error implements ErrorCode {
  code: number;

  constructor(message: string) {
    super(message);
    this.name = "BadRequestException";
    this.code = HttpStatusCodes.BAD_REQUEST;
  }
}

class UnprocessableEntityException extends Error implements ErrorCode {
  code: number;

  constructor(message: string) {
    super(message);
    this.name = "UnprocessableEntityException";
    this.code = HttpStatusCodes.UNPROCESSABLE_ENTITY;
  }
}

class ValidationException extends Error implements ErrorCode {
  code: number;

  constructor(message: string) {
    super(message);
    this.name = "ValidationException";
    this.code = HttpStatusCodes.VALIDATION_ERROR;
  }
}

class NotFoundException extends Error implements ErrorCode {
  code: number;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundException";
    this.code = HttpStatusCodes.NOT_FOUND;
  }
}

class UnauthorizedException extends Error implements ErrorCode {
  code: number;

  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedException";
    this.code = HttpStatusCodes.UNAUTHORIZED;
  }
}

class ForbiddenException extends Error implements ErrorCode {
  code: number;

  constructor(message: string) {
    super(message);
    this.name = "ForbiddenException";
    this.code = HttpStatusCodes.FORBIDDEN;
  }
}

class ServiceUnavailableException extends Error implements ErrorCode {
  code: number;

  constructor(message: string) {
    super(message);
    this.name = "ServiceUnavailableException";
    this.code = HttpStatusCodes.SERVICE_UNAVAILABLE;
  }
}

export {
  Exception,
  ResourceExistsException,
  BadRequestException,
  UnprocessableEntityException,
  ValidationException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ServiceUnavailableException,
};