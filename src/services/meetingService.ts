import { meetingTable, photoTable, tagToMeeting } from "@/db/schema";
import { db } from "..";
import { Meeting, MeetingSimple } from "@/types/meeting";
import { ReqFile } from "@/types/file";
import { deleteFile, FileStorage, getFileUrl, uploadFile } from "@/lib/storage";

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
    pdf: ReqFile | undefined;
    coverPhoto: ReqFile;
    photos: ReqFile[];
    tags: number[];
  }): Promise<number> {
    const filesKeys: string[] = [];

    try {
      let pdfStorage: FileStorage | undefined;
      const photosStorage: FileStorage[] = [];

      const coverPhotoStorage: FileStorage = await uploadFile(
        "meeting-cover-photo",
        {
          reqFile: coverPhoto,
          rename: `${title}.jpg`,
        },
      );
      filesKeys.push(coverPhotoStorage.key);

      if (pdf) {
        pdfStorage = await uploadFile("meeting-files", {
          reqFile: pdf,
          rename: `${title}.pdf`,
        });
        filesKeys.push(pdfStorage.key);
      }

      for (const [index, photo] of photos.entries()) {
        const photoStorage = await uploadFile("gallery", {
          reqFile: photo,
          rename: `${title} - foto ${index}.jpg`,
        });
        photosStorage.push(photoStorage);
        filesKeys.push(photoStorage.key);
      }

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
          .returning();

        if (tags.length > 0) {
          await tx.insert(tagToMeeting).values(
            tags.map((tag) => ({
              meetingId: meeting.id,
              tagId: tag,
            })),
          );
        }

        if (photosStorage.length > 0) {
          await tx.insert(photoTable).values(
            photosStorage.map((photo) => ({
              meetingId: meeting.id,
              name: photo.fileName,
              date,
              link: photo.key,
            })),
          );
        }

        return meeting;
      });

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
    page: number = 1,
    pageSize: number = 50,
  ): Promise<MeetingSimple[]> {
    const meetings = await db.query.meetingTable.findMany({
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
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

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
    const meeting = await db.query.meetingTable.findFirst({
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
    });

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
