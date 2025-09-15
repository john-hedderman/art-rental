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

export interface Job {
  id: number;
  clientId: number;
  clientName?: string;
}

export interface HeaderButton {
  id: string;
  label: string;
  type: string;
  buttonClass: string;
  disabled: boolean;
  clickHandler: any;
}
