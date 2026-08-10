import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IArt } from '../../../model/models';

export const ArtDataActions = createActionGroup({
  source: 'Art Data API',
  events: {
    'Load Art Data': emptyProps(), // Initiates API call
    'Load Art Data Success': props<{ artItems: IArt[] }>(), // API Success payload
    'Load Art Data Failure': props<{ errorMessage: string }>() // API Failure payload
  }
});
