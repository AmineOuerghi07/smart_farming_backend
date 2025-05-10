import { Catch, RpcExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class CustomRpcExceptionFilter implements RpcExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const error = exception.getError();
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Check if error is an object with statusCode and message
    if (typeof error === 'object' && error !== null) {
      statusCode = error['statusCode'] || HttpStatus.INTERNAL_SERVER_ERROR;
      message = error['message'] || message;
    } else {
      message = error.toString();
    }

    const errorResponse = {
      status: 'error',
      message,
      statusCode, // Include statusCode in response for clarity
    };

    // For HTTP contexts (if using a gateway), set the status code
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    if (response && response.status) {
      response.status(statusCode);
    }

    return throwError(() => errorResponse);
  }
}
export class CustomRpcException extends RpcException {
    constructor(message: string, statusCode: number) {
      super({ message, statusCode });
    }
  }
  
  // 404 Not Found exception
  export class RpcNotFoundException extends CustomRpcException {
    constructor(message: string) {
      super(message, HttpStatus.NOT_FOUND);
    }
  }
  
  // 400 Bad Request exception
  export class RpcBadRequestException extends CustomRpcException {
    constructor(message: string) {
      super(message, HttpStatus.BAD_REQUEST);
    }
  }
  
  // 401 Unauthorized exception
  export class RpcUnauthorizedException extends CustomRpcException {
    constructor(message: string) {
      super(message, HttpStatus.UNAUTHORIZED);
    }
  }
  
  // 403 Forbidden exception
  export class RpcForbiddenException extends CustomRpcException {
    constructor(message: string) {
      super(message, HttpStatus.FORBIDDEN);
    }
  }
  
  // 409 Conflict exception
  export class RpcConflictException extends CustomRpcException {
    constructor(message: string) {
      super(message, HttpStatus.CONFLICT);
    }
  }
  
  // 500 Internal Server Error exception
  export class RpcInternalServerErrorException extends CustomRpcException {
    constructor(message: string) {
      super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  // Exception for when no data is found
  export class RpcNoDataException extends CustomRpcException {
    constructor(message: string = 'No data found') {
      super(message, HttpStatus.NOT_FOUND);
    }
  }
  
  // Exception for database errors
  export class RpcDatabaseException extends CustomRpcException {
    constructor(error: any) {
      const message = error.message || 'Database operation failed';
      super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}