import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Card } from '../../../shared/components/card/card';
import { Art, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Util } from '../../../shared/util/util';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-art-list',
  imports: [Card, PageHeader, FormsModule],
  templateUrl: './art-list.html',
  styleUrl: './art-list.scss',
  standalone: true,
})
export class ArtList {
  artwork: Art[] = [];

  selection = 'card';

  navigateToAddToCart = () => {};
  navigateToAddArt = () => {};
  headerData: HeaderData = {
    headerTitle: 'Artwork',
    headerButtons: [
      {
        id: 'addArtBtn',
        label: 'Add Art',
        type: 'button',
        buttonClass: 'btn btn-secondary btn-sm',
        disabled: false,
        clickHandler: this.navigateToAddArt,
      },
      {
        id: 'addArtToCartBtn',
        label: 'Add Selected to Job',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: true,
        clickHandler: this.navigateToAddToCart,
      },
    ],
  };

  handleArtCardClick = (id: number, event: PointerEvent) => {
    this.router.navigate(['/art', id]);
  };

  onSelectView(event: any) {
    const newView = event.target.dataset.arView;
    if (newView) {
      localStorage.setItem('artView', newView);
      this.selection = newView;
    }
  }

  setViewSelection() {
    const storedView = localStorage.getItem('artView');
    if (storedView) {
      this.selection = storedView;
    }
  }

  constructor(private dataService: DataService, private router: Router, public util: Util) {
    combineLatest([
      this.dataService.art$,
      this.dataService.jobs$,
      this.dataService.clients$,
    ]).subscribe(([artwork, jobs, clients]) => {
      this.artwork = artwork.map((art: Art) => {
        let job = jobs.find((job) => job.id === art.job?.id);
        if (job) {
          const client = clients.find((client) => client.id === job?.client?.id);
          if (client) {
            job = { ...job, client };
          }
          return { ...art, job };
        }
        return art;
      });
    });
    this.setViewSelection();
  }
}
