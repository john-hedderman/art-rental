export interface Art {
  id: number;
  artist: string;
  name: string;
  url: string;
  tags: string;
  job: Job;
}

export interface Artist {
  id: number;
  name: string;
  photo: string;
  types: string;
}

export interface Client {
  id: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  industry: string;
  jobs: Job[];
}

export interface Job {
  id: string;
  clientId: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  client: Client;
  art: Art[];
}

export interface HeaderButton {
  id: string;
  label: string;
  type: string;
  buttonClass: string;
  disabled: boolean;
  clickHandler: any;
}

export interface HeaderData {
  headerTitle: string;
  headerButtons: HeaderButton[];
}
