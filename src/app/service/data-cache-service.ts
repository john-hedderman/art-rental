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

  // loadData2 associated with _cacheData and cacheData()
  async loadData2(collections: any = [], forceRefresh = false): Promise<any> {
    console.warn(`loadData2, entry`);
    if (this._cacheData() && !forceRefresh) {
      console.warn(
        `loadData2, cache exists and not refreshing, returning cache:`,
        this._cacheData()
      );
      return this._cacheData();
    }
    try {
      let response: any = {};
      for (let collection of collections) {
        // console.warn(`loadData, collection:`, collection);
        const url = `${environment.apiUrl}/data/${this.collections[collection]['collection']}`;
        // console.warn(`loadData, url: ${url}`);
        response[collection] = await firstValueFrom(this.http.get<any[]>(`${url}`));
      }

      console.warn(`loadData2, setting cache to HTTP response`);
      // the following DOES trigger the effect in Art2List
      this._cacheData.set(response); // Set the cache to the art array
      return response;
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
    console.warn(`loadData2, done`);
  }

  refreshCache(collections: any[]): Promise<void> {
    return this.loadData2(collections, true);
  }

  // this screams of poor performance at any kind of scale
  // need a better model
  //    perhaps bite the bullet and cache different data types separately as a plain array each
  //    instead of everything in one object, with keys to the different tyeps of arrays (art, artists, etc)
  updateCache(updatedData: any[]): Promise<any> {
    const cacheData: CacheItem | null = this.cacheData();
    // console.warn(`original cache data:`, cacheData);
    let newCacheData;
    if (cacheData) {
      newCacheData = Object.assign({}, cacheData);
      for (let updatedItem of updatedData) {
        // console.warn(`updated item:`, updatedItem);
        for (let document of updatedItem.data) {
          // console.warn(`document:`, document);
          const documentIndex = this.collections[updatedItem.type].index;
          // console.warn(`index for ${updatedItem.type}: ${documentIndex}`);
          for (let cacheDataType of Object.keys(newCacheData)) {
            if (updatedItem.type === cacheDataType) {
              // console.warn(
              //   `updated item type "${updatedItem.type}" matches cache data type "${cacheDataType}", looking for a match`
              // );
              const cacheDataTypeData = newCacheData[cacheDataType];
              // console.warn(`cache data of type "${cacheDataType}":`, cacheDataTypeData);

              for (let cacheDataTypeItem of cacheDataTypeData) {
                if (cacheDataTypeItem[documentIndex] === document[documentIndex]) {
                  console.warn(
                    `updateCache, found a match, updating new cache item:`,
                    cacheDataTypeItem
                  );
                  cacheDataTypeItem = Object.assign(cacheDataTypeItem, document); // preserve field "_id" and any others not included in updated item
                  console.warn(
                    `updateCache, found a match, updated new cache item:`,
                    cacheDataTypeItem
                  );
                }
              }
            }
          }
        }
      }
      console.warn(`updateCache, setting new cache data:`, newCacheData);
      // the following DOES NOT FOR SOME REASON trigger the effect in Art2List
      this._cacheData.set(newCacheData);
      console.warn(`updateCache, done setting new cache data:`, newCacheData);
      return Promise.resolve(newCacheData);
    }
    console.warn(`updateCache, no cache data, would set it to the updated data`);
    // TODO: no cache yet - set it to the updated data (transformed first)
    return Promise.resolve(null);
  }

  replaceCacheLocal(data: any) {
    this._cacheData.set(data); // Set the cache
  }
}
