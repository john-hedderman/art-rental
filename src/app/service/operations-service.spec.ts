import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { OperationsService } from './operations-service';
import { DataService } from './data-service';
import * as Const from '../constants';

const mockDataService = {
  saveDocument: () => Promise.resolve({ modifiedCount: 1 }),
  deleteDocument: () => Promise.resolve({ deletedCount: 1 }),
  deleteDocuments: () => Promise.resolve({ deletedCount: 1 }),
};

describe('OperationsService', () => {
  let service: OperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), { provide: DataService, useValue: mockDataService }],
    });
    service = TestBed.inject(OperationsService);
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Save document', () => {
    afterEach(() => {
      mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
    });

    it('should save a document', async () => {
      mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 1 });
      const returnData = await service.saveDocument({}, 'artists', 123, 'artist_id');
      expect(returnData).toBe(Const.SUCCESS);
    });

    it('should fail to save a document if nothing was modified in the database', async () => {
      mockDataService.saveDocument = () => Promise.resolve({ modifiedCount: 0 });
      const returnData = await service.saveDocument({}, 'artists', 123, 'artist_id');
      expect(returnData).toBe(Const.FAILURE);
    });

    it('should fail to save a document if an error occurred trying to save it in the database', async () => {
      mockDataService.saveDocument = () => {
        throw new Error('Save failed.');
      };

      let returnData;
      try {
        returnData = await service.saveDocument({}, 'artists', 123, 'artist_id');
      } catch (error) {
        expect(returnData).toBe(Const.FAILURE);
      }
    });
  });

  describe('Delete document', () => {
    afterEach(() => {
      mockDataService.deleteDocument = () => Promise.resolve({ deletedCount: 1 });
    });

    it('should delete a document', async () => {
      mockDataService.deleteDocument = () => Promise.resolve({ deletedCount: 1 });
      const returnData = await service.deleteDocument('artists', 'artist_id', 123);
      expect(returnData).toBe(Const.SUCCESS);
    });

    it('should fail to delete a document if nothing was modified in the database', async () => {
      mockDataService.deleteDocument = () => Promise.resolve({ deletedCount: 0 });
      const returnData = await service.deleteDocument('artists', 'artist_id', 123);
      expect(returnData).toBe(Const.FAILURE);
    });

    it('should fail to delete a document if an error occurred trying to delete it in the database', async () => {
      mockDataService.deleteDocument = () => {
        throw new Error('Delete failed.');
      };

      let returnData;
      try {
        returnData = await service.deleteDocument('artists', 'artist_id', 123);
      } catch (error) {
        expect(returnData).toBe(Const.FAILURE);
      }
    });
  });

  describe('Delete documents', () => {
    afterEach(() => {
      mockDataService.deleteDocuments = () => Promise.resolve({ deletedCount: 1 });
    });

    it('should delete documents', async () => {
      mockDataService.deleteDocuments = () => Promise.resolve({ deletedCount: 1 });
      const returnData = await service.deleteDocuments('artists', 'client_id', 99);
      expect(returnData).toBe(Const.SUCCESS);
    });

    it('should fail to delete documents if nothing was modified in the database', async () => {
      mockDataService.deleteDocuments = () => Promise.resolve({ deletedCount: 0 });
      const returnData = await service.deleteDocuments('artists', 'client_id', 99);
      expect(returnData).toBe(Const.FAILURE);
    });

    it('should fail to delete documents if an error occurred trying to delete them in the database', async () => {
      mockDataService.deleteDocuments = () => {
        throw new Error('Delete failed.');
      };

      let returnData;
      try {
        returnData = await service.deleteDocuments('artists', 'client_id', 99);
      } catch (error) {
        expect(returnData).toBe(Const.FAILURE);
      }
    });
  });
});
