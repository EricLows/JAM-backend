import type { Context } from "hono";
import { JaimeService } from "@/services/jaimeService";
import { ControllerResponse, JamResponse, TypedRequest } from "@/lib/validator";
import { JaimePhoto, JaimeVideo } from "@/types/jaime";
import { JaimeValidator } from "@/validators/jaimeValidator";

class JaimeController {
  /*
   * Salva uma foto do Jaime
   */
  async postJaimePhoto(c: Context): Promise<Response> {
    try {
      const formData = await c.req.formData();

      const jaimePhoto = formData.get("photo") as File;

      if (!jaimePhoto) {
        return c.json(
          new JamResponse({
            field: "jaimePhoto",
            message: "Insira uma foto do Jaime",
          }),
          401,
        );
      }

      process.env.DB_CONNECTION = c.env.HYPERDRIVE?.connectionString;
      const response = await JaimeService.postJaimePhoto({
        jaimePhoto,
      });

      return c.json({ id: response }, 201);
    } catch (e) {
      throw e;
    }
  }

  /*
   * Salva um video do Jaime
   */
  async postJaimeVideo(c: Context): Promise<Response> {
    try {
      const formData = await c.req.formData();

      const name = formData.get("name") as string;
      const jaimeVideo = formData.get("video") as File;

      if (!jaimeVideo) {
        return c.json(
          new JamResponse({
            field: "jaimeVideo",
            message: "Insira um video do Jaime",
          }),
          401,
        );
      }

      process.env.DB_CONNECTION = c.env.HYPERDRIVE?.connectionString;
      const response = await JaimeService.postJaimeVideo({
        name,
        jaimeVideo,
      });

      return c.json({ id: response }, 201);
    } catch (e) {
      throw e;
    }
  }

  /*
   * Busca uma lista de fotos do Jaime
   */
  async getJaimePhotos(c: Context): Promise<Response> {
    try {
      process.env.DB_CONNECTION = c.env.HYPERDRIVE?.connectionString;
      const jaimePhotos = await JaimeService.getJaimePhotos();

      return c.json(
        new JamResponse({
          data: jaimePhotos,
        }),
        200,
      );
    } catch (e) {
      throw e;
    }
  }

  /*
   * Busca uma lista de vídeos do Jaime
   */
  async getJaimeVideos(c: Context): Promise<Response> {
    try {
      process.env.DB_CONNECTION = c.env.HYPERDRIVE?.connectionString;
      const jaimeVideos = await JaimeService.getJaimeVideos();

      return c.json(
        new JamResponse({
          data: jaimeVideos,
        }),
        200,
      );
    } catch (e) {
      throw e;
    }
  }
}

export { JaimeController };
