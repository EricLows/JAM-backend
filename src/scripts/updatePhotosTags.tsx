import dotenv from "dotenv";
import { createDb } from "../db/db";
import { tagToPhoto } from "../db/schema";

async function main() {
  if (process.env.NODE_ENV == "dev") {
    const result = dotenv.config();

    if (result.error) {
      console.log(result.error);
      process.exit(0);
    }
  }

  console.log(`Obtendo encontros`);
  console.log(process.env.DATABASE_URL);

  const [db, client] = createDb(process.env.DB_CONNECTION, true);
  const meetings = await db.query.meetingTable
    .findMany({
      columns: {
        id: true,
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
        photos: {
          NOT: {
            tags: {},
          },
        },
      },
    })
    .prepare("get_meetings")
    .execute();

  console.dir(meetings, { depth: null });

  const tagsData: {
    tagId: number;
    photoId: number;
  }[] = [];
  let numPhotos = 0;

  if (meetings.length) {
    for (const meeting of meetings) {
      const tagIds = meeting.tags.map((t) => t.id);

      for (const photo of meeting.photos) {
        numPhotos += 1;
        for (const tagId of tagIds) {
          tagsData.push({
            photoId: photo.id,
            tagId,
          });
        }
      }
    }

    await db
      .insert(tagToPhoto)
      .values(tagsData)
      .prepare("set_photo_tags")
      .execute();
  }

  console.log(`${tagsData.length} tag(s) criada(s) em ${numPhotos} foto(s)`);

  await client.close();
}

main();
