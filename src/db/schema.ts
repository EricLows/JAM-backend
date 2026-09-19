import { integer, pgTable, text } from "drizzle-orm/pg-core";
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
