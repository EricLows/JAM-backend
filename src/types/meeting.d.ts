export type Meeting = {
  id: number,
  title: string,
  description: string,
  coverPhoto: string,
  responsible: string,
  date: Date | null,
  pdf: string | null,
};
