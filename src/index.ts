import express from "express";
import dotenv from "dotenv";
import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";

import { seed } from "./db/seed.ts";
import loginRouter from "./routes/loginRoutes.ts";
 
dotenv.config();

export const db = drizzle(process.env.DATABASE_URL!);
seed();

const port = process.env.PORT;
const app = express();

dotenv.config({
  path: path.dirname(".") + `/env/${process.env.NODE_ENV ?? "dev"}.env`,
});

app.use(express.json());

app.use("/login", loginRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});