import { Injectable } from '@angular/core';

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
}
