export interface Art {
  id: number;
  artist: string;
  name: string;
  url: string;
}

export interface Artist {
  id: number;
  name: string;
  photo: string;
  types: string;
}

export interface Client {
  id: number;
  name: string;
  industry: string;
}
