import type { Request, Response, NextFunction } from "express";
import { LogService } from "@/services/logService";
import { LogValidator } from "@/validators/logValidator.ts";
import { ControllerResponse, JamResponse, TypedRequest } from "@/lib/validator";
import { Log } from "@/types/log";

class LogController {
  /*
   * Busca os logs registrados
   */
  async getLogs(
    req: TypedRequest<typeof LogValidator.getLogs>,
    res: Response,
    next: NextFunction,
  ): ControllerResponse<Log[]> {
    try {
      const { page, pageSize } = req.query;
      const logs = await LogService.getLogs(Number(page), Number(pageSize));

      return res.status(200).json(
        new JamResponse({
          data: logs,
        }),
      );
    } catch (e) {
      next(e);
    }
  }
}

export { LogController };
