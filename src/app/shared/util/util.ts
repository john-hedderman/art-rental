import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Util {
  handleArtCardClick = (id: number, event: PointerEvent) => {
    const tgt = event.target as HTMLElement;
    if (tgt.id === 'cardFooter' || tgt.id === 'cardFormCheck' || tgt.id === 'cardCheck') {
      return;
    }
    this.router.navigate(['/art', id]);
  };

  constructor(private router: Router) {}
}
