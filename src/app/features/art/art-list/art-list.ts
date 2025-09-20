import { Component } from '@angular/core';

import { Card } from '../../../shared/components/card/card';
import { Art, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader2 } from '../../../shared/components/page-header-2/page-header-2';

@Component({
  selector: 'app-art-list',
  imports: [Card, PageHeader2],
  templateUrl: './art-list.html',
  styleUrl: './art-list.scss',
  standalone: true,
  host: {
    class: 'overflow-y-auto',
  },
})
export class ArtList {
  artwork: Art[] = [];

  navigateToAddToCart = () => {};
  navigateToAddArt = () => {};
  headerData: HeaderData = {
    headerTitle: 'Add Art',
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
        label: 'Add Selected to Cart',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: true,
        clickHandler: this.navigateToAddToCart,
      },
    ],
  };

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

  constructor(private dataService: DataService) {
    this.dataService.art$.subscribe((artwork) => {
      if (artwork) {
        this.artwork = artwork;
      }
    });
  }
}
