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
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  industry: string;
}

export interface HeaderButton {
  text: string;
  type: string;
  buttonClass: string;
  clickHandler: any;
}
