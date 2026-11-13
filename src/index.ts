import dotenv from "dotenv";
import express from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "./db/seed.ts";
import { handleError } from "./lib/error.ts";
import { relations, setCypherKey } from "./db/schema.ts";
import cors from "cors";

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

const port = process.env.PORT;
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN_URL
}));

app.use(express.json());

app.use("/meeting", meetingRouter);
app.use("/suggestion", suggestionRouter);
app.use("/login", loginRouter);
app.use("/log", logRouter);
app.use("/tag", tagRouter);

app.use(handleError);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});