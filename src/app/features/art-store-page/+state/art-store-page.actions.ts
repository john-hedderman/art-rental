import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IArt } from '../../../model/models';

export const DataActions = createActionGroup({
  source: 'Data API',
  events: {
    'Load Data': emptyProps(), // Initiates API call
    'Load Data Success': props<{ items: IArt[] }>(), // API Success payload
    'Load Data Failure': props<{ errorMessage: string }>() // API Failure payload
  }
});
