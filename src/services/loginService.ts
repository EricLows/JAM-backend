import { User, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "..";

const LoginService = {
  /*
   * Acessa uma conta, caso ela exista
   */
  async login(
    email: string,
    password: string,
  ): Promise<User> {
    const [result] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (!result) {
      throw 'E-mail não existe';
    }

    if (result.password != password) {
      throw 'Senha incorreta';
    }

    return result;
  },

  /*
   * Verifica se existe um determinado e-mail cadastrado
   */
  async emailExists(email: string): Promise<boolean> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

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
      throw 'E-mail já existe';
    }

    const [result] = await db
      .insert(usersTable)
      .values({
        username,
        email,
        password,
        avatar,
      })
      .returning();

    return result[0].id;
  },
};

export { LoginService };
