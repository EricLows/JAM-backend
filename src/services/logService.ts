import { logsTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Log } from "@/types/log";
import { createDb } from "../db/db";

const LogService = {
  /*
   * Registra um log
   */
  async log(logType: string, message: string): Promise<number> {
    const [db, client] = createDb(process.env.DB_CONNECTION, true);
    const [result] = await db
      .insert(logsTable)
      .values({
        logType,
        message,
      })
      .returning()
      .prepare("log")
      .execute();

    await client.close();
    return result.id;
  },

  /*
   * Busca os logs registrados
   */
  async getLogs(page: number = 1, pageSize: number = 50): Promise<Log[]> {
    const [db, client] = createDb(process.env.DB_CONNECTION, true);
    const results = await db
      .select()
      .from(logsTable)
      .orderBy(desc(logsTable.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .prepare("get_logs")
      .execute();

    await client.close();
    return results;
  },
};

export { LogService };
