import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

type CacheItem = {
  [key: string]: any[];
};

@Injectable({
  providedIn: 'root'
})
export class DataCacheService {
  private http = inject(HttpClient);
  private collections: any = {
    art: {
      collection: 'art',
      index: 'art_id'
    },
    artists: {
      collection: 'artists',
      index: 'artist_id'
    },
    jobs: {
      collection: 'jobs',
      index: 'job_id'
    },
    clients: {
      collection: 'clients',
      index: 'client_id'
    },
    sites: {
      collection: 'sites',
      index: 'site_id'
    }
  };

  private _cache = signal<any[] | null>(null);
  readonly data = computed(() => this._cache());

  private _cacheData = signal<CacheItem | null>(null);
  readonly cacheData = computed(() => this._cacheData());

  async loadData(collections: any = [], forceRefresh = false): Promise<any> {
    if (this._cacheData() && !forceRefresh) {
      return this._cacheData();
    }
    try {
      let response: any = {};
      for (let collection of collections) {
        const url = `${environment.apiUrl}/data/${this.collections[collection]['collection']}`;
        response[collection] = await firstValueFrom(this.http.get<any[]>(`${url}`));
      }
      this._cacheData.set(response); // Set the cache to the art array
      return response;
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  }

  refreshCache(collections: any[]): Promise<void> {
    return this.loadData(collections, true);
  }

  // this screams of poor performance at any kind of scale
  // need a better model
  //    perhaps bite the bullet and cache different data types separately as a plain array each
  //    instead of everything in one object, with keys to the different tyeps of arrays (art, artists, etc)
  updateCache(updatedData: any[]): Promise<any> {
    const cacheData: CacheItem | null = this.cacheData();
    if (cacheData) {
      const newCacheData = Object.assign({}, cacheData);
      for (let updatedItem of updatedData) {
        for (let document of updatedItem.data) {
          const documentIndex = this.collections[updatedItem.type].index;
          for (let cacheDataType of Object.keys(newCacheData)) {
            if (updatedItem.type === cacheDataType) {
              const cacheDataTypeData = newCacheData[cacheDataType];
              for (let cacheDataTypeItem of cacheDataTypeData) {
                if (cacheDataTypeItem[documentIndex] === document[documentIndex]) {
                  cacheDataTypeItem = Object.assign(cacheDataTypeItem, document); // preserve field "_id" and any others not included in updated item
                }
              }
            }
          }
        }
      }
      this._cacheData.set(newCacheData);
      return Promise.resolve(newCacheData);
    }
    // TODO: no cache yet - set it to the updated data (transformed first)
    return Promise.resolve(null);
  }

  replaceCacheLocal(data: any) {
    this._cacheData.set(data); // Set the cache
  }
}
