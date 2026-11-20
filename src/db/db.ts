import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./schema";

type Database = ReturnType<typeof drizzle<typeof relations>>;
type Client = ReturnType<typeof postgres>;

export function createDb(connectionString?: string): Database;
export function createDb(
  connectionString: string | undefined,
  includeClient: true,
): [Database, Client];
export function createDb(connectionString?: string, includeClient = false) {
  const hasConnectionString =
    connectionString && connectionString !== "undefined";
  const client = hasConnectionString
    ? postgres(connectionString, {
      max: 5,
      prepare: true,
      fetch_types: false,
    })
    : postgres(process.env.DATABASE_URL!, { prepare: true });
  const db = drizzle({ client, relations });

  return includeClient ? [db, client] : db;
}
