import type { Request, Response, NextFunction } from "express";
import { LogService } from "@/services/logService";
import { LogValidator } from "@/validators/logValidator.ts";
import { TypedRequest } from "@/lib/validator";

class LogController {
  async getLogs(
    req: TypedRequest<typeof LogValidator.getLogs>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { page, pageSize } = req.params;
      const logs = await LogService.getLogs(page, pageSize);

      return res.status(200).json({
        logs,
      });
    } catch (e) {
      next(e);
    }
  }
}

export { LogController };
