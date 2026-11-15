import dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "./db/seed";
import { handleError } from "./lib/error";
import { relations, setCypherKey } from "./db/schema";

import loginRouter from "./routes/loginRoutes";
import logRouter from "./routes/logRoutes";
import suggestionRouter from "./routes/suggestionRoutes";
import meetingRouter from "./routes/meetingRoutes.";
import tagRouter from "./routes/tagRoutes";

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