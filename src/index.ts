import { drizzle } from 'drizzle-orm/node-postgres';
import loginRouter from "./routes/loginRoutes.ts";
import express from "express";
import dotenv from 'dotenv';
import path from 'path';

const app = express();

dotenv.config({ path: path.dirname('.') + `/env/${process.env.NODE_ENV ?? 'dev'}.env` });

const PORT = process.env.PORT || 3000;
export const db = drizzle(process.env.DATABASE_URL!);

app.use(express.json());

app.use('/login', loginRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
