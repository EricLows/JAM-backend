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
    origin: (origin, c) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://jam-pscb.com.br",
      ];

      return allowedOrigins.includes(origin)
        ? origin
        : "";
    },
    allowMethods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowHeaders: [
      "Content-Type",
      "Authorization",
    ],
    exposeHeaders: [
      "Content-Length",
    ],
    credentials: true,
  }),
);

app.route("/meeting", meetingRouter);
app.route("/suggestion", suggestionRouter);
app.route("/login", loginRouter);
app.route("/log", logRouter);
app.route("/tag", tagRouter);

app.onError((err, c) => handleError(err as any, c));

app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: "Route not found",
    },
    404,
  );
});

export default app;