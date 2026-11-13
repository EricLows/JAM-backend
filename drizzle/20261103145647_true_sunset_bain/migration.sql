CREATE TABLE "meeting" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "meeting_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"coverPhoto" text NOT NULL,
	"responsible" text NOT NULL,
	"date" date,
	"pdf" text,
	"likes" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "photo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "photo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"date" date,
	"link" text,
	"meetingId" integer
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tag_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tagToMeeting" (
	"meetingId" integer,
	"tagId" integer,
	CONSTRAINT "tagToMeeting_pkey" PRIMARY KEY("meetingId","tagId")
);
--> statement-breakpoint
CREATE TABLE "tagToPhoto" (
	"photoId" integer,
	"tagId" integer,
	CONSTRAINT "tagToPhoto_pkey" PRIMARY KEY("photoId","tagId")
);
--> statement-breakpoint
ALTER TABLE "tagToMeeting" ADD CONSTRAINT "tagToMeeting_meetingId_meeting_id_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id");--> statement-breakpoint
ALTER TABLE "tagToMeeting" ADD CONSTRAINT "tagToMeeting_tagId_tag_id_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id");--> statement-breakpoint
ALTER TABLE "tagToPhoto" ADD CONSTRAINT "tagToPhoto_photoId_photo_id_fkey" FOREIGN KEY ("photoId") REFERENCES "photo"("id");--> statement-breakpoint
ALTER TABLE "tagToPhoto" ADD CONSTRAINT "tagToPhoto_tagId_tag_id_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id");