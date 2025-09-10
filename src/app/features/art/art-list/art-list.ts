import { Component, OnInit } from '@angular/core';

import { Card } from '../../../shared/card/card';
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

  navigateToAddArt = () => {};

  setAddToCartButtonState = () => {
    const addArtToCartBtn = document.getElementById('addArtToCartBtn');
    if (!addArtToCartBtn) {
      return;
    }

    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      'input.ar-form-check-input[type=checkbox]'
    );
    if (!checkboxes || checkboxes.length < 1) {
      return;
    }

    let disabled = true;
    for (const checkbox of checkboxes) {
      if (checkbox.checked) {
        disabled = false;
        break;
      }
    }

    if (disabled) {
      addArtToCartBtn.setAttribute('disabled', '');
    } else {
      addArtToCartBtn.removeAttribute('disabled');
    }
  };

  headerButtons: HeaderButton[] = [
    {
      id: 'addArtBtn',
      text: 'Add Art',
      type: 'button',
      buttonClass: 'btn btn-secondary',
      disabled: false,
      clickHandler: this.navigateToAddArt,
    },
    {
      id: 'addArtToCartBtn',
      text: 'Add Selected to Cart',
      type: 'button',
      buttonClass: 'btn btn-primary',
      disabled: true,
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
