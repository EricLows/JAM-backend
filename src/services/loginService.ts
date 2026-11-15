import { User, usersTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { JamError } from "@/lib/error";
import { createDb } from "../db/db";

const LoginService = {
  /*
   * Acessa uma conta, caso ela exista
   */
  async login(email: string, password: string): Promise<User> {
    const db = createDb(process.env.DB_CONNECTION);
    const loginQuery = db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, sql.placeholder("email")))
      .limit(1)
      .prepare("login");
    const [result] = await loginQuery.execute({ email });

    if (!result) {
      throw new JamError(403, "E-mail não existe", "email");
    }

    if (result.password != password) {
      throw new JamError(403, "Senha incorreta", "password");
    }

    return result;
  },

  /*
   * Verifica se existe um determinado e-mail cadastrado
   */
  async emailExists(email: string): Promise<boolean> {
    const db = createDb(process.env.DB_CONNECTION);
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .prepare("email_exists")
      .execute();

    return result.length > 0;
  },

  /*
   * Registra uma conta com um determinado e-mail, nome de usuário,
   * senha e foto de perfil
   */
  async register(
    username: string,
    email: string,
    password: string,
    avatar?: string,
  ): Promise<number> {
    if (await this.emailExists(email)) {
      throw new JamError(403, "E-mail já existe", "email");
    }

    const db = createDb(process.env.DB_CONNECTION);
    const [result] = await db
      .insert(usersTable)
      .values({
        username,
        email,
        password,
        avatar,
      })
      .returning()
      .prepare("register")
      .execute();

    return result[0].id;
  },
};

export { LoginService };
