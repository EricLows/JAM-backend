import { meetingTable, photoTable, tagToMeeting } from "@/db/schema";
import { db } from "..";
import { desc } from "drizzle-orm";
import { Meeting } from "@/types/meeting";
import { ReqFile } from "@/types/file";
import { deleteFile, FileStorage, uploadFile } from "@/lib/storage";

const MeetingService = {
  /*
   * Registra um meeting
   */
  async postMeeting({
    date,
    description,
    responsible,
    title,
    pdf,
    coverPhoto,
    photos,
    tags
  }: {
    date: Date,
    description: string,
    responsible: string,
    title: string,
    pdf: ReqFile | undefined,
    coverPhoto:ReqFile,
    photos: ReqFile[],
    tags: number[],
  }): Promise<number> {
    const filesKeys: string[] = [];

    try {
      let pdfStorage: FileStorage | undefined;
      const photosStorage: FileStorage[] = [];

      const coverPhotoStorage: FileStorage = await uploadFile(coverPhoto);
      filesKeys.push(coverPhotoStorage.key);

      if (pdf) {
        pdfStorage = await uploadFile(pdf);
        filesKeys.push(pdfStorage.key);
      }

      for (const photo of photos) {
        const photoStorage = await uploadFile(photo);
        photosStorage.push(photoStorage);
        filesKeys.push(photoStorage.key);
      }

      const result = await db.transaction(async (tx) => {
        const [meeting] = await db
          .insert(meetingTable)
          .values({
            date,
            description,
            responsible,
            title,
            coverPhoto: coverPhotoStorage.key,
            pdf: pdfStorage?.key,
          })
          .returning();

        if (tags.length > 0) {
          await tx.insert(tagToMeeting).values(
            tags.map((tag) => ({
              meetingId: meeting.id,
              tagId: tag,
            }))
          );
        }

        if (photosStorage.length > 0) {
          await tx.insert(photoTable).values(
            photosStorage.map((photo) => ({
              meetingId: meeting.id,
              name: photo.fileName,
              date,
              link: photo.key,
            }))
          );
        }

        return meeting;
      });

      return result.id;
    }
    catch(e) {
      for (const key of filesKeys) {
        await deleteFile(key);
      }
      throw e;
    }
  },

  /*
   * Busca os meetings registrados
   */
  async getMeetings(
    page: number = 1,
    pageSize: number = 50,
  ): Promise<Meeting[]> {
    const results = await db
      .select()
      .from(meetingTable)
      .orderBy(desc(meetingTable.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    return results;
  },
};

export { MeetingService };
