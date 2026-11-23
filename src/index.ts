import dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/postgres-js";
import { seed } from "./db/seed";
import { handleError } from "./lib/error";
import { relations, setCypherKey } from "./db/schema";

import loginRouter from "./routes/loginRoutes";
import logRouter from "./routes/logRoutes";
import suggestionRouter from "./routes/suggestionRoutes";
import meetingRouter from "./routes/meetingRoutes";
import galleryRouter from "./routes/galleryRoutes";
import tagRouter from "./routes/tagRoutes";
import postgres from "postgres";
import { serve } from "@hono/node-server";
import jaimeRouter from "./routes/jaimeRoutes";

let port: number | undefined;

if (process.env.NODE_ENV == "dev") {
  const result = dotenv.config();

  if (result.error) {
    console.log(result.error);
    process.exit(0);
  }

  port = Number(process.env.PORT);
  console.log(port);
}

function createDb(connectionString: string) {
  const client = postgres(connectionString, {
    max: 5,
    prepare: true,
    fetch_types: false,
  });

  return drizzle({ client, relations });
}

const app = new Hono<{
  Bindings: {
    HYPERDRIVE: any;
  };
  Variables: {
    db: ReturnType<typeof createDb>;
  };
}>();

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://jam-pscb.com.br",
      ];

      return allowedOrigins.includes(origin) ? origin : "";
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
  }),
);

app.route("/meeting", meetingRouter);
app.route("/gallery", galleryRouter);
app.route("/suggestion", suggestionRouter);
app.route("/login", loginRouter);
app.route("/log", logRouter);
app.route("/tag", tagRouter);
app.route("/jaime", jaimeRouter);

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

if (port) {
  serve({
    fetch: app.fetch,
    port,
  })
}

export default app;
