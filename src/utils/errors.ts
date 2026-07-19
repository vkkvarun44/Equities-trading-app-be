export class AppError extends Error {
  readonly statusCode: number
  readonly isOperational: boolean

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.isOperational = isOperational
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  readonly errors?: Record<string, string[]>

  constructor(message = 'Validation failed', errors?: Record<string, string[]>) {
    super(400, message)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, message)
    this.name = 'ConflictError'
  }
}

export class AlpacaApiError extends AppError {
  readonly alpacaCode?: number
  readonly requestId?: string

  constructor(
    message: string,
    statusCode: number,
    alpacaCode?: number,
    requestId?: string
  ) {
    super(statusCode, message)
    this.name = 'AlpacaApiError'
    this.alpacaCode = alpacaCode
    this.requestId = requestId
  }
}
