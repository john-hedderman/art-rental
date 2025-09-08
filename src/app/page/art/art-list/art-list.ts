import { Component, OnInit } from '@angular/core';

import { Card } from '../../../components/card/card';
import { ArtService } from '../../../service/art-service';
import { Art, HeaderButton } from '../../../model/models';
import { PageHeaderService } from '../../../service/page-header-service';

@Component({
  selector: 'app-art-list',
  imports: [Card],
  templateUrl: './art-list.html',
  styleUrl: './art-list.scss',
  standalone: true,
  host: {
    class: 'overflow-y-auto',
  },
})
export class ArtList implements OnInit {
  artwork: Art[] = [];

  headerTitle = 'Art';

  navigateToAddToCart = () => {};

  headerButtons: HeaderButton[] = [
    {
      text: 'Add Selected to Cart',
      type: 'button',
      buttonClass: 'btn btn-primary',
      clickHandler: this.navigateToAddToCart,
    },
  ];

  constructor(private artService: ArtService, private pageHeaderService: PageHeaderService) {
    this.artService.getArtData().subscribe((data) => {
      this.artwork = data;
    });
  }

  ngOnInit(): void {
    this.pageHeaderService.sendData({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
  }
}
