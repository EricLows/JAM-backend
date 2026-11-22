export type Photo = {
    id: number;
    link: string;
    name: string;
    date: Date;
    tags: {
        id: number;
        name: string;
    }[]
}