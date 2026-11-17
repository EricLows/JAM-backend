import { Photo } from "@/types/photo";
import { getFileUrl } from "@/lib/storage";
import { createDb } from "../db/db";
import { EmptyFilter } from "drizzle-orm";

const GalleryService = {
  /*
   * Busca as fotos da galeria
   */
  async getGallery(
    search?: string,
    page: number = 1,
    pageSize: number = 50,
  ): Promise<Photo[]> {
    const db = createDb(process.env.DB_CONNECTION);
    const gallery = await db.query.photoTable
      .findMany({
        columns: {
          id: true,
          link: true,
          name: true,
        },
        where: {
          name: search?.length
            ? {
                ilike: `%${search}%`,
              }
            : EmptyFilter,
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: {
          date: "desc",
        },
      })
      .prepare("get_gallerys")
      .execute();

    if (gallery.length === 0) {
      return [];
    }

    return gallery.map(
      (photo): Photo => ({
        id: photo.id,
        link: getFileUrl(photo.link),
        name: photo.name,
      }),
    );
  },
};

export { GalleryService };
