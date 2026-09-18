import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";
import { AES } from "crypto-ts";
import { InferSelectModel } from "drizzle-orm";

/*
 * Criptografia
 */

const aesKey = process.env.AES_CYPHER_KEY ?? 'cypherKey';

const encryptedText = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return "text";
  },

  toDriver(value: string) {
    return AES.encrypt(value, aesKey).toString();
  },

  fromDriver(value: string) {
    return AES.decrypt(value, aesKey).toString();
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