import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";
import { AES, enc } from "crypto-ts";
import { InferSelectModel } from "drizzle-orm";

/*
 * Criptografia
 */

let aesKey: string | undefined;

export function setCypherKey(key?: string) {
  aesKey = key;
}

const encryptedText = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return "text";
  },

  toDriver(value: string) {
    return aesKey ? AES.encrypt(value, aesKey).toString() : value;
  },

  fromDriver(value: string) {
    return aesKey ? AES.decrypt(value, aesKey).toString(enc.Utf8) : value;
  },
});

/*
 * Logs
 */

export const logsTable = pgTable("logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  logType: text().notNull(),
  message: text().notNull(),
  dateTime: timestamp('created_at', { mode: 'date' }).defaultNow(), 
});

export type Logs = InferSelectModel<typeof logsTable>;

/*
 * Sugestões
 */

export const suggestionTable = pgTable("suggestions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text(),
  message: text().notNull(),
  dateTime: timestamp('created_at', { mode: 'date' }).defaultNow(), 
});

export type Suggestion = InferSelectModel<typeof suggestionTable>;

/*
 * Usuários
 */

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().notNull(),
  avatar: text(),
  email: text().notNull().unique(),
  password: encryptedText().notNull(),
});

export type User = InferSelectModel<typeof usersTable>;
