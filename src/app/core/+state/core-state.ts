import { IArt, IArtist, IClient, IContact, IJob, ISite, ITag } from '../../model/models';

export interface DataState {
  data: {
    art: IArt[];
    artists: IArtist[];
    clients: IClient[];
    contacts: IContact[];
    jobs: IJob[];
    sites: ISite[];
    tags: ITag[];
  };
  loading: boolean;
  error: string | null;
}

export const initialState: DataState = {
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
  error: null
};
