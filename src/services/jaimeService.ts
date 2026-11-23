import { jaimePhotoTable, jaimeVideoTable } from "@/db/schema";
import { JaimePhoto, JaimeVideo } from "@/types/jaime";
import { ReqFile } from "@/types/file";
import { deleteFile, FileStorage, getFileUrl, uploadFile } from "@/lib/storage";
import { createDb } from "../db/db";
import { EmptyFilter } from "drizzle-orm";
import { JamLog } from "../lib/error";

const JaimeService = {
  /*
   * Guarda uma foto do Jaime
   */
  async postJaimePhoto({ jaimePhoto }: { jaimePhoto: File }): Promise<number> {
    try {
      JamLog("Subindo imagem 'jaimePhoto'");

      const jaimePhotoStorage: FileStorage = await uploadFile(
        "jaime-photo",
        jaimePhoto,
        `Jaime_em_todo_seu_esplendor.jpg`,
      );

      JamLog("'jaimePhoto' postada");

      const [db, client] = createDb(process.env.DB_CONNECTION, true);
      JamLog("Inserindo foto do Jaime no banco de dados");

      const result = await db.insert(jaimePhotoTable)
          .values({
              link: jaimePhotoStorage.key,
            })
          .returning()
          .prepare("create_jaime_photo")
          .execute();

      JamLog("Foto inserida, encerrando função");

      await client.close();
      return result[0].id;
    } catch (e) {
      throw e;
    }
  },

  /*
   * Guarda um video do Jaime
   */
  async postJaimeVideo({ name, jaimeVideo }: { name: string, jaimeVideo: File }): Promise<number> {
    try {
      JamLog("Subindo imagem 'jaimeVideo'");

      const jaimeVideoStorage: FileStorage = await uploadFile(
        "jaime-video",
        jaimeVideo,
        `Jaime_em_todo_seu_esplendor.mp4`,
      );

      JamLog("'jaimeVideo' postada");

      const [db, client] = createDb(process.env.DB_CONNECTION, true);
      JamLog("Inserindo video do Jaime no banco de dados");

      const result = await db.insert(jaimeVideoTable)
          .values({
              name,
              link: jaimeVideoStorage.key,
            })
          .returning()
          .prepare("create_jaime_video")
          .execute();

      JamLog("Video inserido, encerrando função");

      await client.close();
      return result[0].id;
    } catch (e) {
      throw e;
    }
  },

  /*
   * Busca as fotos do Jaime
   */
  async getJaimePhotos(): Promise<JaimePhoto[]> {
    const [db, client] = createDb(process.env.DB_CONNECTION, true);
    const jaimePhotos = await db
          .select()
          .from(jaimePhotoTable)
          .prepare("get_jaime_photos")
          .execute();
    
    await client.close();
    if (jaimePhotos.length === 0) {
      return [];
    }

    return jaimePhotos.map(
      (jaimePhoto): JaimePhoto => ({
        id: jaimePhoto.id,
        link: getFileUrl(jaimePhoto.link),
      }),
    );
  },

  /*
   * Busca os videos do Jaime
   */
  async getJaimeVideos(): Promise<JaimeVideo[]> {
    const [db, client] = createDb(process.env.DB_CONNECTION, true);
    const jaimeVideos = await db
          .select()
          .from(jaimeVideoTable)
          .prepare("get_jaime_videos")
          .execute();
    

    await client.close();
    if (jaimeVideos.length === 0) {
      return [];
    }

    return jaimeVideos.map(
      (jaimeVideo): JaimeVideo => ({
        id: jaimeVideo.id,
        name: jaimeVideo.name,
        link: getFileUrl(jaimeVideo.link),
      }),
    );
  },
};

export { JaimeService };
