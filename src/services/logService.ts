import { logsTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Log } from "@/types/log";
import { createDb } from "../db/db";

const LogService = {
  /*
   * Registra um log
   */
  async log(logType: string, message: string): Promise<number> {
    const db = createDb(process.env.DB_CONNECTION);
    const [result] = await db
      .insert(logsTable)
      .values({
        logType,
        message,
      })
      .returning()
      .prepare("log")
      .execute();

    return result.id;
  },

  /*
   * Busca os logs registrados
   */
  async getLogs(page: number = 1, pageSize: number = 50): Promise<Log[]> {
    const db = createDb(process.env.DB_CONNECTION);
    const results = await db
      .select()
      .from(logsTable)
      .orderBy(desc(logsTable.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .prepare("get_logs")
      .execute();
    return results;
  },
};

export { LogService };
