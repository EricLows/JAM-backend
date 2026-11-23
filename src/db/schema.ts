import {
  date,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";
import { AES, enc } from "crypto-ts";
import { defineRelations, InferSelectModel } from "drizzle-orm";

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
  dateTime: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export type Logs = InferSelectModel<typeof logsTable>;

/*
 * Sugestões
 */

export const suggestionTable = pgTable("suggestions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text(),
  message: text().notNull(),
  dateTime: timestamp("created_at", { mode: "date" }).defaultNow(),
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

/*
 * Encontros
 */

export const meetingTable = pgTable("meeting", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text().notNull(),
  description: text().notNull(),
  coverPhoto: text().notNull(),
  responsible: text().notNull(),
  date: date({ mode: "date" }),
  pdf: text(),
  likes: integer().default(0),
});

/*
 * Foto
 */

export const photoTable = pgTable("photo", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  date: date({ mode: "date" }),
  link: text().notNull(),
  meetingId: integer().references(() => meetingTable.id),
});

/*
 * Tag de Encontro
 */
export const tagTable = pgTable("tag", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
});

export const tagToMeeting = pgTable(
  "tagToMeeting",
  {
    meetingId: integer()
      .notNull()
      .references(() => meetingTable.id),
    tagId: integer()
      .notNull()
      .references(() => tagTable.id),
  },
  (t) => [
    primaryKey({
      columns: [t.meetingId, t.tagId],
    }),
  ],
);

export const tagToPhoto = pgTable(
  "tagToPhoto",
  {
    photoId: integer()
      .notNull()
      .references(() => photoTable.id),
    tagId: integer()
      .notNull()
      .references(() => tagTable.id),
  },
  (t) => [
    primaryKey({
      columns: [t.photoId, t.tagId],
    }),
  ],
);

/*
 * Foto do Jaime
 */

export const jaimePhotoTable = pgTable("jaimePhoto", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  link: text().notNull(),
});

/*
 * Vídeo do Jaime
 */

export const jaimeVideoTable = pgTable("jaimeVideo", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  link: text().notNull(),
});

/*
 * Relações
 */
export const relations = defineRelations(
  { meetingTable, photoTable, tagTable, tagToMeeting, tagToPhoto, jaimePhotoTable, jaimeVideoTable },
  (r) => ({
    photoTable: {
      meeting: r.one.meetingTable({
        from: r.photoTable.meetingId,
        to: r.meetingTable.id,
      }),
      tags: r.many.tagTable({
        from: r.photoTable.id.through(r.tagToPhoto.photoId),
        to: r.tagTable.id.through(r.tagToPhoto.tagId),
      }),
    },
    meetingTable: {
      photos: r.many.photoTable(),
      tags: r.many.tagTable({
        from: r.meetingTable.id.through(r.tagToMeeting.meetingId),
        to: r.tagTable.id.through(r.tagToMeeting.tagId),
      }),
    },
    tagTable: {
      meetings: r.many.meetingTable(),
      photo: r.many.photoTable(),
    },
  }),
);

export type User = InferSelectModel<typeof usersTable>;
