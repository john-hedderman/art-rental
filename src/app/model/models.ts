export interface Art {
  id: number;
  file: string;
  path: string;
  fullSizePath: string;
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
  contacts: Contact[];
}

export interface Job {
  id: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  client: Client;
  contacts: Contact[];
  art: Art[];
  site: Site;
}

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  title: string;
  client: Client;
}

export interface Site {
  id: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  client: Client;
  job: Job;
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
