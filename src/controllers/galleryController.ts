import type { Context } from "hono";
import { GalleryService } from "@/services/galleryService";
import { JamResponse } from "@/lib/validator";
import { Photo } from "@/types/photo";

class GalleryController {
  /*
   * Busca as fotos da galeria
   */
  async getGallery(c: Context): Promise<Response> {
    try {
      const { search, page, pageSize } = c.req.query();

      process.env.DB_CONNECTION = c.env.HYPERDRIVE?.connectionString;
      const gallery = await GalleryService.getGallery(
        search,
        Number(page),
        Number(pageSize),
      );

      return c.json(
        new JamResponse({
          data: gallery,
        }),
        200,
      );
    } catch (e) {
      throw e;
    }
  }
}

export { GalleryController };
