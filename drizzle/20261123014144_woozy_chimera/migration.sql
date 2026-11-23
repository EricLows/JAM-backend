CREATE TABLE "jaimePhoto" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jaimePhoto_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"link" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jaimeVideo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jaimeVideo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"link" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "photo" ALTER COLUMN "link" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_meetingId_meeting_id_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id");