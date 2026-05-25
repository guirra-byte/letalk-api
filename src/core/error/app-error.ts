export class AppError extends Error {
  public readonly statusCode: number;
  public readonly source: string;

  constructor(src: string, reason: string, statusCode: number) {
    super(reason);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.source = src;
    Error.captureStackTrace?.(this, this.constructor);
    console.error(`[ERROR on ${src} - ${statusCode}]: ${reason}`);
  }
}
