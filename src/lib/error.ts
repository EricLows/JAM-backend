import type { Context } from "hono";
import { JamResponse } from "./validator";

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

    Object.setPrototypeOf(this, JamError.prototype);
  }
}

/**
 * Tratador de erros customizado do Hono
 */
export const handleError = (err: Error, c: Context): Response => {
  console.error("========== ERROR HANDLER ==========");
  console.error("Name:", err.name);
  // console.error("Message:", err.message);
  // console.error("Stack:", err.stack);
  // console.error("Instance of JamError:", err instanceof JamError);
  console.dir(err, { depth: null });

  if (err instanceof JamError) {
    return c.json(
      new JamResponse({
        message: err.message,
        field: err.field,
        metadata: err.metadata,
      }),
      err.statusCode as any,
    );
  }

  return c.json(
    new JamResponse({
      message: "Erro interno do servidor :(",
      metadata: err.stack ?? "",
    }),
    500,
  );
};

/**
 * Log para caso a flag de DEBUG esteja ligada
 */
export function JamLog(data: any) {
  if (process.env.DEBUG) {
    console.dir(data, { depth: null });
  }
}
