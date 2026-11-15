import type { Context } from "hono";
import { TagService } from "@/services/tagService";
import { JamResponse } from "@/lib/validator";

class TagController {
  /*
   * Registra uma tag de foto/encontro
   */
  async postTag(c: Context): Promise<Response> {
    try {
      const { name } = await c.req.json().catch(() => ({ name: undefined }));
      const response = await TagService.postTag({
        name,
      });

      return c.json({ id: response }, 201);
    } catch (e) {
      throw e;
    }
  }

  /*
   * Busca uma lista de tags
   */
  async getTags(c: Context): Promise<Response> {
    try {
      const tags = await TagService.getTags();

      return c.json(
        new JamResponse({
          data: tags,
        }),
        200,
      );
    } catch (e) {
      throw e;
    }
  }
}

export { TagController };
