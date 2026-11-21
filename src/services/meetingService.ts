import { meetingTable, photoTable, tagToMeeting } from "@/db/schema";
import { Meeting, MeetingSimple } from "@/types/meeting";
import { ReqFile } from "@/types/file";
import { deleteFile, FileStorage, getFileUrl, uploadFile } from "@/lib/storage";
import { createDb } from "../db/db";
import { EmptyFilter } from "drizzle-orm";
import { JamLog } from "../lib/error";

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
    tags,
  }: {
    date: Date;
    description: string;
    responsible: string;
    title: string;
    pdf: File | undefined;
    coverPhoto: File;
    photos: File[];
    tags: number[];
  }): Promise<number> {
    const filesKeys: string[] = [];

    try {
      let pdfStorage: FileStorage | undefined;
      const photosStorage: FileStorage[] = [];

      JamLog("Subindo imagem 'coverPhoto'");

      const coverPhotoStorage: FileStorage = await uploadFile(
        "meeting-cover-photo",
        coverPhoto,
        `${title}.jpg`,
      );
      filesKeys.push(coverPhotoStorage.key);

      JamLog("'coverPhoto' postada");

      if (pdf) {
        JamLog("Subindo arquivo 'pdf'");
        pdfStorage = await uploadFile("meeting-files", pdf, `${title}.pdf`);
        filesKeys.push(pdfStorage.key);
        JamLog("'pdf' postado");
      }

      JamLog("Subindo fotos'");
      for (const [index, photo] of photos.entries()) {
        const photoStorage = await uploadFile(
          "gallery",
          photo,
          `${title} - foto ${index}.jpg`,
        );
        photosStorage.push(photoStorage);
        filesKeys.push(photoStorage.key);
      }
      JamLog("Fotos postadas");

      const [db, client] = createDb(process.env.DB_CONNECTION, true);
      const result = await db.transaction(async (tx) => {
        JamLog("Criando encontro no banco de dados");

        const [meeting] = await tx
          .insert(meetingTable)
          .values({
            date,
            description,
            responsible,
            title,
            coverPhoto: coverPhotoStorage.key,
            pdf: pdfStorage?.key,
          })
          .returning()
          .prepare("create_meeting")
          .execute();

        JamLog("Encontro criado");

        if (tags.length > 0) {
          JamLog("Criando tags");

          await tx
            .insert(tagToMeeting)
            .values(
              tags.map((tag) => ({
                meetingId: meeting.id,
                tagId: tag,
              })),
            )
            .prepare("set_meeting_tags")
            .execute();

          JamLog("Tags criadas");
        }

        if (photosStorage.length > 0) {
          JamLog("Inserindo fotos no banco de dados");

          await tx
            .insert(photoTable)
            .values(
              photosStorage.map((photo) => ({
                meetingId: meeting.id,
                name: photo.fileName,
                date,
                link: photo.key,
              })),
            )
            .prepare("create_meeting_photos")
            .execute();

          JamLog("Fotos inseridas");
        }


        return meeting;
      });

      JamLog("Encerrando função");

      await client.close();
      return result.id;
    } catch (e) {
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
    search?: string,
    minDate?: Date,
    maxDate?: Date,
    tags?: number[],
    page: number = 1,
    pageSize: number = 50,
  ): Promise<MeetingSimple[]> {
    const [db, client] = createDb(process.env.DB_CONNECTION, true);
    console.log("DB conectado!");
    const meetings = await db.query.meetingTable
      .findMany({
        columns: {
          id: true,
          title: true,
          description: true,
          date: true,
          coverPhoto: true,
          likes: true,
          pdf: true,
          responsible: true,
        },
        with: {
          photos: {
            columns: {
              id: true,
            },
          },
          tags: true,
        },
        where: {
          OR: search?.length
            ? [
                {
                  title: {
                    ilike: `%${search}%`,
                  },
                },
                {
                  responsible: {
                    ilike: `%${search}%`,
                  },
                },
              ]
            : EmptyFilter,
          date: {
            gte: minDate ? minDate : EmptyFilter,
            lte: maxDate ? maxDate : EmptyFilter,
          },
          tags: tags?.length
            ? {
                id: {
                  in: tags,
                },
              }
            : EmptyFilter,
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: {
          date: "desc",
        },
      })
      .prepare("get_meetings")
      .execute();

    await client.close();
    if (meetings.length === 0) {
      return [];
    }

    return meetings.map(
      (meeting): MeetingSimple => ({
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        responsible: meeting.responsible,
        coverPhoto: getFileUrl(meeting.coverPhoto),
        date: meeting.date,
        pdf: meeting.pdf ? true : false,
        photos: meeting.photos.length,
        tags: meeting.tags,
      }),
    );
  },

  /*
   * Busca um determinado encontro
   */
  async getMeeting(id: number): Promise<Meeting | undefined> {
    const [db, client] = createDb(process.env.DB_CONNECTION, true);
    const meeting = await db.query.meetingTable
      .findFirst({
        columns: {
          id: true,
          title: true,
          description: true,
          date: true,
          coverPhoto: true,
          likes: true,
          pdf: true,
          responsible: true,
        },
        with: {
          photos: {
            columns: {
              id: true,
              link: true,
              name: true,
              date: true,
            },
          },
          tags: true,
        },
        where: {
          id,
        },
      })
      .prepare("get_meeting")
      .execute();

    await client.close();
    if (!meeting) return undefined;

    return {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      responsible: meeting.responsible,
      coverPhoto: getFileUrl(meeting.coverPhoto),
      date: meeting.date,
      pdf: meeting.pdf ? getFileUrl(meeting.pdf) : null,
      photos: meeting.photos.map((photo) => ({
        ...photo,
        link: getFileUrl(photo.link),
      })),
      tags: meeting.tags,
      likes: meeting.likes ?? 0,
    };
  },
};

export { MeetingService };
