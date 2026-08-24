import { IArt, IArtist, IClient, IContact, IJob, ISite, ITag } from '../../model/models';

export interface AppData {
  art: IArt[];
  artists: IArtist[];
  clients: IClient[];
  contacts: IContact[];
  jobs: IJob[];
  sites: ISite[];
  tags: ITag[];
}
export interface AppState {
  data: AppData;
  loading: boolean;
  opStatus: string | null;
  error: string | null;
}

export const initialState: AppState = {
  data: {
    art: [],
    artists: [],
    clients: [],
    contacts: [],
    jobs: [],
    sites: [],
    tags: []
  },
  loading: false,
  opStatus: null,
  error: null
};
