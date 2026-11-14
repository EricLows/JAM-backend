export type MeetingSimple = {
  id: number,
  title: string,
  description: string,
  coverPhoto: string,
  responsible: string,
  date: Date | null,
  pdf: boolean,
  photos: number,
  tags: {
    id: number,
    name: string,
  }[]
};

export type Meeting = {
  id: number,
  title: string,
  description: string,
  coverPhoto: string,
  responsible: string,
  date: Date | null,
  pdf: string | null,
  likes: number,
  photos: {
    id: number,
    link: string,
    name: string,
  }[],
  tags: {
    id: number,
    name: string,
  }[]
};
