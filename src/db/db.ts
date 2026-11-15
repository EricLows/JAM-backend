import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./schema";

export function createDb(connectionString?: string) {
  if (connectionString && connectionString != "undefined") {
    const client = postgres(connectionString, {
      max: 5,
      prepare: true,
      fetch_types: false,
    });

    return drizzle({ client, relations });
  }

  const client = postgres(process.env.DATABASE_URL!, { prepare: true });
  return drizzle({ client, relations });
}
