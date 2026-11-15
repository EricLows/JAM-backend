import dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "./db/seed.ts";
import { handleError } from "./lib/error.ts";
import { relations, setCypherKey } from "./db/schema.ts";

import loginRouter from "./routes/loginRoutes.ts";
import logRouter from "./routes/logRoutes.ts";
import suggestionRouter from "./routes/suggestionRoutes.ts";
import meetingRouter from "./routes/meetingRoutes..ts";
import tagRouter from "./routes/tagRoutes.ts";

const result = dotenv.config();

if (result.error) {
  console.log(result.error);
  process.exit(0);
}

export const db = drizzle(process.env.DATABASE_URL!, { relations });

setCypherKey(process.env.AES_CYPHER_KEY);
seed();

const app = new Hono();
const port = Number(process.env.PORT ?? 3000);

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN_URL ?? "*",
  }),
);

app.route("/meeting", meetingRouter);
app.route("/suggestion", suggestionRouter);
app.route("/login", loginRouter);
app.route("/log", logRouter);
app.route("/tag", tagRouter);

app.onError((err, c) => handleError(err as any, c));

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server is running at http://localhost:${info.port}`);
});

export default app;