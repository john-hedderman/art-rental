import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, take } from 'rxjs';

import { Art, HeaderData } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { DataService } from '../../../service/data-service';

@Component({
  selector: 'app-art-detail',
  imports: [PageHeader, RouterLink],
  templateUrl: './art-detail.html',
  styleUrl: './art-detail.scss',
  standalone: true,
})
export class ArtDetail {
  art: Art = {} as Art;

  navigateToArtList = () => {
    this.router.navigate(['/art', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Art detail',
    headerButtons: [
      {
        id: 'goToArtListBtn',
        label: 'Art list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToArtList,
      },
    ],
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    const artId = this.route.snapshot.paramMap.get('id');
    combineLatest({
      artwork: this.dataService.art$,
      jobs: this.dataService.jobs$,
      clients: this.dataService.clients$,
    })
      .pipe(take(1))
      .subscribe(({ artwork, jobs, clients }) => {
        const tempArt = artwork.map((art: Art) => {
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
        this.art = tempArt.find((art: Art) => art.id === +artId!) ?? ({} as Art);
      });
  }
}
