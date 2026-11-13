export type Meeting = {
  id: number,
  title: string,
  description: string,
  coverPhoto: string,
  responsible: string,
  date: Date | null,
  pdf: string | null,
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
