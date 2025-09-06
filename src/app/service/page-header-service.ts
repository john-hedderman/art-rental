import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PageHeaderService {
  private headerDataSubject = new Subject<any>();
  data$ = this.headerDataSubject.asObservable();

  sendData(data: any) {
    this.headerDataSubject.next(data);
  }
}
