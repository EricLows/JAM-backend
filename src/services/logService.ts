import { logsTable } from "@/db/schema";
import { db } from "..";
import { desc } from "drizzle-orm";

const LogService = {
  /*
   * Registra um log
   */
  async log(logType: string, message: string) {
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
  async getLogs(page: number = 0, pageSize: number = 50) {
    const results = await db
      .select()
      .from(logsTable)
      .orderBy(desc(logsTable.id))
      .offset(page * pageSize)
      .limit(pageSize);

    return results;
  },
};

export { LogService };
