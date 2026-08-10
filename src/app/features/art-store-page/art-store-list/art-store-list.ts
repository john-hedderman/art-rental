import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';

import { Card } from '../../../shared/components/card/card';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ActionButton, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { AddButton } from '../../../shared/buttons/add-button';
import { ArtDataActions } from '../+state/art-store-page.actions';
import { selectArt } from '../+state/art-store-page.selectors';

@Component({
  selector: 'app-art-store-list',
  imports: [Card, PageHeader, FormsModule, PageFooter, AsyncPipe],
  templateUrl: './art-store-list.html',
  styleUrl: './art-store-list.scss',
  standalone: true
})
export class ArtStoreList implements OnInit {
  goToArtDetail = (id: number) => {};
  goToAddArt = () => {};

  updateVortex = () => {};
  updateVortexBtn = new ActionButton(
    'updateVortexBtn',
    'Update Ethereal Vortex Imagined',
    'button',
    'btn btn-primary ms-3',
    false,
    null,
    null,
    this.updateVortex
  );

  headerData = new HeaderActions('art-store-list', 'Art', [], []);
  footerData = new FooterActions([new AddButton('Add Art', this.goToAddArt), this.updateVortexBtn]);

  thumbnail_path = 'images/art/';

  private store = inject(Store);

  art$ = this.store.select((state) => state.data.art);

  constructor() {
    this.art$ = this.store.select(selectArt);
  }

  ngOnInit(): void {
    this.store.dispatch(ArtDataActions.loadArtData());
  }
}
