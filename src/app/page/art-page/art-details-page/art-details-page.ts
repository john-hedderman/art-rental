import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, filter, from, of, Subject, Subscription, switchMap, takeUntil, tap } from 'rxjs';

import { Art } from '../../../shared/models';
import { ArtService } from '../../../service/art-service';

@Component({
  selector: 'app-art-details-page',
  imports: [],
  templateUrl: './art-details-page.html',
  styleUrl: './art-details-page.scss',
  standalone: true,
  host: {
    class: 'col',
  },
})
export class ArtDetailsPage implements OnInit, OnDestroy {
  artworkId: number | null | undefined;
  art: Art | undefined;
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private artService: ArtService) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const artworkId = params.get('artworkId');
          this.artworkId = artworkId !== null ? +artworkId : null;
          return of(this.artworkId);
        }),
        switchMap((artworkId) => {
          return artworkId !== null ? this.artService.getArtData() : EMPTY;
        })
      )
      .subscribe((art) => {
        const matchedArt = art.filter((artwork) => artwork.id === this.artworkId);
        if (matchedArt && matchedArt.length === 1) {
          this.art = matchedArt[0];
        } else {
          console.log('no matches:', matchedArt);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
