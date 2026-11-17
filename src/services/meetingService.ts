import { meetingTable, photoTable, tagToMeeting } from "@/db/schema";
import { Meeting, MeetingSimple } from "@/types/meeting";
import { ReqFile } from "@/types/file";
import { deleteFile, FileStorage, getFileUrl, uploadFile } from "@/lib/storage";
import { createDb } from "../db/db";
import { EmptyFilter } from "drizzle-orm";

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
      console.log("Vamos começar");
      
      let pdfStorage: FileStorage | undefined;
      const photosStorage: FileStorage[] = [];

      const coverPhotoStorage: FileStorage = await uploadFile(
        "meeting-cover-photo",
        coverPhoto,
        `${title}.jpg`,
      );
      filesKeys.push(coverPhotoStorage.key);

      console.log("Subimos o arquivo coverPhoto");
      if (pdf) {
        console.log("Vamos subir o PDF");
        pdfStorage = await uploadFile("meeting-files", pdf, `${title}.pdf`);
        filesKeys.push(pdfStorage.key);
        console.log("PDF foi");
      }

      console.log("Vamos Subir as fotos");
      for (const [index, photo] of photos.entries()) {
        const photoStorage = await uploadFile(
          "gallery",
          photo,
          `${title} - foto ${index}.jpg`,
        );
        photosStorage.push(photoStorage);
        filesKeys.push(photoStorage.key);
      }
      console.log("Fotos foi");

      const db = createDb(process.env.DB_CONNECTION);
      console.log("Inserindo no banco de dados");
      const result = await db.transaction(async (tx) => {
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

          console.log("Meeting foi");
        if (tags.length > 0) {
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
        }

        console.log("Tags foi");
        if (photosStorage.length > 0) {
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
        }

        return meeting;
      });

      console.log("Foi tudo");
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
    page: number = 1,
    pageSize: number = 50,
  ): Promise<MeetingSimple[]> {
    const db = createDb(process.env.DB_CONNECTION);
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
              link: true,
              name: true,
            },
          },
          tags: true,
        },
        where: {
          title: search?.length
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
      .prepare("get_meetings")
      .execute();

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
    const db = createDb(process.env.DB_CONNECTION);
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
