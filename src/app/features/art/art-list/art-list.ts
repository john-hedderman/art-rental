import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Card } from '../../../shared/components/card/card';
import { Art, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';

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

  navigateToArtDetail = (id: number, event: PointerEvent) => {
    const tgt = event.target as HTMLElement;
    if (tgt.id === 'cardFooter' || tgt.id === 'cardFormCheck' || tgt.id === 'cardCheck') {
      return;
    }
    this.router.navigate(['/art', id]);
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

  constructor(private dataService: DataService, private router: Router) {
    this.dataService.art$.subscribe((artwork) => {
      if (artwork) {
        this.artwork = artwork;
      }
    });
    this.setViewSelection();
  }
}
