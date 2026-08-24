import { usersTable } from "@/db/schema";
import { db } from "@/index";
import { eq } from "drizzle-orm";

const LoginService = {
  async emailExists(email: string) {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return result.length > 0;
  },

  async register(
    username: string,
    email: string,
    password: string,
  ) {
    const result = await db
      .insert(usersTable)
      .values({
        username,
        email,
        password,
      })
      .returning();

      return result[0].id;
  },
};

export { LoginService };
