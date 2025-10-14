export interface Art {
  art_id: number;
  file: string;
  path: string;
  full_size_path: string;
  artist: string;
  name: string;
  url: string;
  tags: string;
  job: Job;
}

export interface Artist {
  artist_id: number;
  name: string;
  photo: string;
  types: string;
}

export interface Client {
  client_id: number;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip_code: string;
  industry?: string;
  jobs: Job[];
  contacts: Contact[];
}

export interface Job {
  id: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip_code: string;
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
  email?: string;
}

export interface Site {
  id: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip_code: string;
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
