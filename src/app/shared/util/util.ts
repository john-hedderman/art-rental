import { Injectable } from '@angular/core';

import * as Const from '../../constants';

@Injectable({
  providedIn: 'root',
})
export class Util {
  static showHideRowDetail = () => {
    let detailRows;
    if (window.innerWidth >= 768) {
      detailRows = document.querySelectorAll('.datatable-row-detail:not(.d-none)');
      detailRows.forEach((detailRow) => {
        detailRow.classList.add('d-none');
      });
    } else {
      detailRows = document.querySelectorAll('.datatable-row-detail.d-none');
      detailRows.forEach((detailRow) => {
        detailRow.classList.remove('d-none');
      });
    }
  };

  static replaceTokens = (template: string, replacements: { [key: string]: string }): string => {
    let result = template;
    for (const key in replacements) {
      if (replacements.hasOwnProperty(key)) {
        result = result.replace(`{${key}}`, replacements[key]);
      }
    }
    return result;
  };

  static jobResult(statuses: string[]): string {
    return statuses.includes(Const.FAILURE) ? Const.FAILURE : Const.SUCCESS;
  }
}
