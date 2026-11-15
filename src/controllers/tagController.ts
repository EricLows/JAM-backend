import type { Context } from "hono";
import { TagService } from "@/services/tagService";
import { ControllerResponse, JamResponse } from "@/lib/validator";
import { Tag } from "@/types/tag";

class TagController {
  /*
   * Registra uma tag de foto/encontro
   */
  async postTag(c: Context): ControllerResponse<Tag[]> {
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
  async getTags(c: Context): ControllerResponse<Tag[]> {
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
