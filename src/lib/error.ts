import type { NextFunction, Request, Response } from "express";

export class JamError extends Error {
  public statusCode: number;
  public message: string;
  public field: string;
  public metadata: string;

  constructor(
    statusCode: number,
    message?: string,
    field?: string,
    metadata?: string,
  ) {
    super();
    this.statusCode = statusCode;
    this.message = message ?? "";
    this.field = field ?? "";
    this.metadata = metadata ?? "";
  }
}

/**
 * Tratador de erros customizado do Express
 */
export const handleError = (
  err: JamError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { statusCode, message, field, metadata } = err;

  console.log(err.message);
  console.log(err.stack);

  if (!statusCode) {
    statusCode = 500;
    message = err.message;
    metadata = err.stack ?? "";
  }

  res.status(statusCode).json({
    statusCode,
    message,
    field,
    metadata,
  });
};
