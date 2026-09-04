import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, take } from 'rxjs';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { IArtist } from '../../../model/models';
import { Collections } from '../../../shared/enums/collections';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { SaveButton } from '../../../shared/buttons/save-button';
import { ResetButton } from '../../../shared/buttons/reset-button';
import { CancelButton } from '../../../shared/buttons/cancel-button';
import { selectArtistById } from '../../artists-ngrx/+state/artists-ngrx.selectors';
import { ArtistActions } from '../+state/artists-ngrx.actions';

@Component({
  imports: [PageHeader, ReactiveFormsModule, PageFooter],
  selector: 'app-add-artist-ngrx',
  styleUrl: './add-artist-ngrx.scss',
  templateUrl: './add-artist-ngrx.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class AddArtistNgrx extends AddBase implements OnInit, OnDestroy {
  router = inject(Router);
  fb = inject(FormBuilder);
  store = inject(Store);

  goToArtistList = () => this.router.navigate(['/artists-ngrx', 'list']);
  artistListLink = new ActionLink(
    'artistListLink',
    'Artists',
    '/artists/list',
    '',
    this.goToArtistList
  );

  headerData = new HeaderActions('artist-add', 'Add Artist', [], [this.artistListLink.data]);
  footerData = new FooterActions([new SaveButton(), new ResetButton(), new CancelButton()]);

  dbData: IArtist = {} as IArtist;

  artistForm!: FormGroup;

  submitted = false;
  editMode = false;
  saveStatus = '';

  artistId!: number;
  artistItem$: Observable<IArtist>;

  destroy$ = new Subject<void>();

  override populateData(): void {
    // this also effectively touches the form fields, so those prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.artistForm.get('artist_id')?.setValue(this.dbData.artist_id);
    this.artistForm.get('name')?.setValue(this.dbData.name);
    this.artistForm.get('photo_path')?.setValue(this.dbData.photo_path);
  }

  override preSave(): void {
    this.disableSaveBtn();
    const artistId = this.route.snapshot.paramMap.get('id');
    this.artistId = artistId ? +artistId : Date.now();
    this.artistForm.value.artist_id = this.artistId;
  }

  override async save(): Promise<string> {
    this.saveArtist();
    // FIXME: dummy return for now - will update all other pages' save() methods to be similar, relying on state.opStatus
    return '';
  }

  override resetForm(): void {
    this.submitted = false;
    if (this.editMode) {
      this.populateForm<IArtist>(Collections.Artists, 'artist_id', this.artistId);
    } else {
      this.clearForm();
    }
  }

  async onSubmit(): Promise<void> {
    this.submitForm(this.artistForm, ['artists'], 'artist');
  }

  onClickReset() {
    this.resetForm();
  }

  clearForm() {
    this.artistForm.reset();
  }

  saveArtist() {
    this.store.dispatch(
      ArtistActions.addOrEditArtist({
        isEdit: this.editMode,
        artist: this.artistForm.value
      })
    );
  }

  setArtistId() {
    this.artistId = Date.now();
    this.editMode = false;
    const artistId = this.route.snapshot.paramMap.get('id');
    if (artistId) {
      this.artistId = +artistId;
      this.editMode = true;
      this.headerData.data.headerTitle = 'Edit Artist';
    }
  }

  constructor() {
    super();
    this.setArtistId();
    this.artistItem$ = this.store.select(selectArtistById(this.artistId));
  }

  ngOnInit(): void {
    this.artistForm = this.fb.group({
      artist_id: this.artistId,
      name: [''],
      photo_path: [''],
      tag_ids: this.fb.array([])
    });

    if (this.editMode) {
      this.populateForm<IArtist>(Collections.Artists, 'artist_id', this.artistId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
