import type { Context } from "hono";
import { LogService } from "@/services/logService";
import { ControllerResponse, JamResponse } from "@/lib/validator";
import { Log } from "@/types/log";

class LogController {
  /*
   * Busca os logs registrados
   */
  async getLogs(c: Context): ControllerResponse<Log[]> {
    try {
      const { page, pageSize } = c.req.query();
      const logs = await LogService.getLogs(Number(page), Number(pageSize));

      return c.json(
        new JamResponse({
          data: logs,
        }),
        200,
      );
    } catch (e) {
      throw e;
    }
  }
}

export { LogController };
