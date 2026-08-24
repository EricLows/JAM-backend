import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar().notNull(),
  avatar: varchar(),
  email: varchar().notNull().unique(),
  password: varchar().notNull(),
});
