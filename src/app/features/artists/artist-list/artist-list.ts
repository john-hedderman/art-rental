import { Component, OnInit } from '@angular/core';

import { Artist, HeaderButton } from '../../../model/models';
import { PageHeaderService } from '../../../service/page-header-service';
import { Card } from '../../../shared/card/card';
import { DataService } from '../../../service/data-service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-artist-list',
  imports: [Card],
  templateUrl: './artist-list.html',
  styleUrl: './artist-list.scss',
  standalone: true,
  host: {
    class: 'overflow-y-auto',
  },
})
export class ArtistList implements OnInit {
  artists: Artist[] = [];

  headerTitle = 'Artists';

  headerButtons: HeaderButton[] = [];

  constructor(private pageHeaderService: PageHeaderService, private dataService: DataService) {
    this.dataService
      .load('artists')
      .pipe(take(1))
      .subscribe((data) => {
        this.artists = data;
      });
  }

  ngOnInit(): void {
    this.pageHeaderService.sendData({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
  }
}
