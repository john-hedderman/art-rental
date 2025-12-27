import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DataService } from './data-service';
import { Collections } from '../shared/enums/collections';

const initialLoadURLs = [
  'http://localhost:3000/data/art',
  'http://localhost:3000/data/artists',
  'http://localhost:3000/data/clients',
  'http://localhost:3000/data/contacts',
  'http://localhost:3000/data/jobs',
  'http://localhost:3000/data/sites',
];

const coll = Collections.Artists;
const id = 123;
const field = 'artist_id';
const options = { status: 500 };

describe('DataService', () => {
  let service: DataService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DataService);
  });

  function flushInitialLoadingURLs() {
    let req;
    for (const loadURL of initialLoadURLs) {
      req = httpTestingController.expectOne(loadURL);
      req.flush([]);
    }
  }

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Save documents', () => {
    beforeEach(() => {
      spyOn(window, 'fetch');
    });

    afterEach(() => {
      httpTestingController.verify();
    });

    it('should add a document', async () => {
      const mockData = { insertedId: id, message: `Inserted document into collection '${coll}'.` };
      const mockResponse = new Response(JSON.stringify(mockData));

      (window.fetch as jasmine.Spy).and.resolveTo(mockResponse);

      const returnData = await service.saveDocument({}, Collections.Artists);

      flushInitialLoadingURLs();

      expect(returnData).toEqual(mockData);
    });

    it('should fail to add a document if the response does not indicate success', async () => {
      const mockData = { insertedId: id, message: `Inserted document into collection '${coll}'.` };
      const mockResponse = new Response(JSON.stringify(mockData), options);
      const returnError = 'Save response not ok. Status: 500';

      (window.fetch as jasmine.Spy).and.resolveTo(mockResponse);

      let returnData;
      try {
        returnData = await service.saveDocument({}, Collections.Artists);
      } catch (error) {
        returnData = returnError;
      }

      flushInitialLoadingURLs();

      expect(returnData).toEqual(returnError);
    });

    it('should update a document', async () => {
      const mockData = { modifiedCount: 1, message: `Replaced ${id} in collection '${coll}'.` };
      const mockResponse = new Response(JSON.stringify(mockData));

      (window.fetch as jasmine.Spy).and.resolveTo(mockResponse);

      const returnData = await service.saveDocument({}, Collections.Artists, id, field);

      flushInitialLoadingURLs();

      expect(returnData).toEqual(mockData);
    });
  });

  describe('Delete documents', () => {
    beforeEach(() => {
      spyOn(window, 'fetch');
    });

    afterEach(() => {
      httpTestingController.verify();
    });

    it('should delete a document', async () => {
      const mockData = { deletedCount: 1, message: `Deleted ${id} in collection '${coll}'.` };
      const mockResponse = new Response(JSON.stringify(mockData));

      (window.fetch as jasmine.Spy).and.resolveTo(mockResponse);

      const returnData = await service.deleteDocument(Collections.Artists, id, field);

      flushInitialLoadingURLs();

      expect(returnData).toEqual(mockData);
    });

    it('should fail to delete a document if the response does not indicate success', async () => {
      const mockData = { deletedCount: 1, message: `Deleted ${id} in collection '${coll}'.` };
      const mockResponse = new Response(JSON.stringify(mockData), options);
      const returnError = 'Delete response not ok. Status: 500';

      (window.fetch as jasmine.Spy).and.resolveTo(mockResponse);

      let returnData;
      try {
        returnData = await service.deleteDocument(Collections.Artists, id, field);
      } catch (error) {
        returnData = returnError;
      }

      flushInitialLoadingURLs();

      expect(returnData).toEqual(returnError);
    });

    it('should delete documents', async () => {
      const clientField = 'client_id';
      const mockData = {
        deletedCount: 1,
        message: `Deleted documents in collection '${coll}'.`,
      };
      const mockResponse = new Response(JSON.stringify(mockData));

      (window.fetch as jasmine.Spy).and.resolveTo(mockResponse);

      const returnData = await service.deleteDocuments(Collections.Artists, clientField, id);

      flushInitialLoadingURLs();

      expect(returnData).toEqual(mockData);
    });

    it('should fail to delete documents if the response does not indicate success', async () => {
      const mockData = {
        deletedCount: 1,
        message: `Deleted documents in collection '${coll}'.`,
      };
      const mockResponse = new Response(JSON.stringify(mockData), options);
      const returnError = 'Delete response not ok. Status: 500';

      (window.fetch as jasmine.Spy).and.resolveTo(mockResponse);

      let returnData;
      try {
        returnData = await service.deleteDocuments(Collections.Artists, field, id);
      } catch (error) {
        returnData = returnError;
      }

      flushInitialLoadingURLs();

      expect(returnData).toEqual(returnError);
    });
  });
});
