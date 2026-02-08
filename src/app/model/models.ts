export interface Art {
  art_id: number;
  title: string;
  file_name: string;
  full_size_image_url: string;
  tag_ids: number[];
  tags?: ITag[];
  artist_id: number;
  artist?: Artist;
  job_id: number;
  job?: Job;
}

export interface Artist {
  artist_id: number;
  name: string;
  photo_path: string;
  tag_ids: number[];
  tags?: ITag[];
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
  contact_ids: number[];
  contacts?: Contact[];
  site_ids: number[];
  sites?: Site[];
  job_ids: number[];
  jobs?: Job[];
}

export interface Job {
  job_id: number;
  job_number: string;
  client_id: number;
  client?: Client;
  site_id: number;
  site?: Site;
  contact_ids: number[];
  contacts?: Contact[];
  art_ids: number[];
  art?: Art[];
}

export interface Contact {
  contact_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  title: string;
  email?: string;
  client_id: number;
  client?: Client;
}

export interface Site {
  site_id: number;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip_code: string;
  client_id: number;
  client?: Client;
  job_id: number;
  job?: Job;
}

export interface HeaderData {
  page: string;
  headerTitle: string;
  headerButtons: HeaderButton[];
  headerLinks: HeaderLink[];
}

export interface HeaderButton {
  id: string;
  label: string;
  type: string;
  buttonClass: string;
  disabled: boolean;
  clickHandler: any;
}

export interface HeaderLink {
  id: string;
  label: string;
  routerLink: string;
  linkClass: string;
  clickHandler: any;
}

export interface OperationStatus {
  status: string;
  message: string;
}

export interface ITag {
  tag_id: number;
  name: string;
  art_ids: number[];
  art?: Art[];
  artist_ids: number[];
  artists?: Artist[];
  [key: string]: number | string | number[] | Art[] | Artist[] | undefined;
}
