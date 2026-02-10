export interface IArt {
  art_id: number;
  title: string;
  file_name: string;
  full_size_image_url: string;
  tag_ids: number[];
  tags?: ITag[];
  artist_id: number;
  artist?: IArtist;
  job_id: number;
  job?: IJob;
}

export interface IArtist {
  artist_id: number;
  name: string;
  photo_path: string;
  tag_ids: number[];
  tags?: ITag[];
}

export interface IClient {
  client_id: number;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip_code: string;
  industry?: string;
  contact_ids: number[];
  contacts?: IContact[];
  site_ids: number[];
  sites?: ISite[];
  job_ids: number[];
  jobs?: IJob[];
}

export interface IJob {
  job_id: number;
  job_number: string;
  client_id: number;
  client?: IClient;
  site_id: number;
  site?: ISite;
  contact_ids: number[];
  contacts?: IContact[];
  art_ids: number[];
  art?: IArt[];
}

export interface IContact {
  contact_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  title: string;
  email?: string;
  client_id: number;
  client?: IClient;
}

export interface ISite {
  site_id: number;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip_code: string;
  client_id: number;
  client?: IClient;
  job_id: number;
  job?: IJob;
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
  art?: IArt[];
  artist_ids: number[];
  artists?: IArtist[];
  [key: string]: number | string | number[] | IArt[] | IArtist[] | undefined;
}
