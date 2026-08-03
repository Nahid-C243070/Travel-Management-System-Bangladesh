export class HttpError extends Error {
  constructor(statusCode, message, code = 'REQUEST_FAILED', details = null) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
