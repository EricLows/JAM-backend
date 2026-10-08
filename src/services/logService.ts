import { logsTable } from "@/db/schema";
import { db } from "..";
import { desc } from "drizzle-orm";
import { Log } from "@/types/log";

const LogService = {
  /*
   * Registra um log
   */
  async log(logType: string, message: string): Promise<number> {
    const [result] = await db
      .insert(logsTable)
      .values({
        logType,
        message,
      })
      .returning();

    return result.id;
  },

  /*
   * Busca os logs registrados
   */
  async getLogs(page: number = 1, pageSize: number = 50): Promise<Log[]> {
    const results = await db
      .select()
      .from(logsTable)
      .orderBy(desc(logsTable.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    return results;
  },
};

export { LogService };
