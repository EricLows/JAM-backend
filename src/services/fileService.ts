import { google } from "googleapis";

export const drive = google.drive({
  version: "v3",
  auth: new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/drive"],
  }),
});
