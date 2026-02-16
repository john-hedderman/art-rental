import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { IArtist } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Collections } from '../../../shared/enums/collections';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { SaveButton } from '../../../shared/buttons/save-button';
import { CancelButton } from '../../../shared/buttons/cancel-button';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { ResetButton } from '../../../shared/buttons/reset-button';

@Component({
  selector: 'app-add-artist',
  imports: [PageHeader, ReactiveFormsModule, PageFooter],
  providers: [MessagesService],
  templateUrl: './add-artist.html',
  styleUrl: './add-artist.scss',
  standalone: true
})
export class AddArtist extends AddBase implements OnInit, OnDestroy {
  goToArtistList = () => this.router.navigate(['/artists', 'list']);
  artistListLink = new ActionLink(
    'artistListLink',
    'Artists',
    '/artists/list',
    '',
    this.goToArtistList
  );
  headerData = new HeaderActions('artist-add', 'Add Artist', [], [this.artistListLink.data]);
  footerData = new FooterActions([new SaveButton(), new ResetButton(), new CancelButton()]);

  artistForm!: FormGroup;
  submitted = false;

  saveStatus = '';

  dbData: IArtist = {} as IArtist;

  artistId!: number;
  editMode = false;

  preSave() {
    this.disableSaveBtn();
    const artistId = this.route.snapshot.paramMap.get('id');
    this.artistId = artistId ? +artistId : Date.now();
    this.artistForm.value.artist_id = this.artistId;
  }

  async save(): Promise<string> {
    const artistStatus = await this.saveArtist();
    return this.jobResult([artistStatus]);
  }

  async onSubmit(): Promise<void> {
    this.submitForm(this.artistForm, ['artists'], 'artist');
  }

  async saveArtist(): Promise<string> {
    return await this.operationsService.saveDocument(
      this.artistForm.value,
      Collections.Artists,
      this.editMode ? this.artistId : undefined,
      this.editMode ? 'artist_id' : undefined
    );
  }

  onClickReset() {
    this.resetForm();
  }

  resetForm() {
    this.submitted = false;
    if (this.editMode) {
      this.populateForm<IArtist>(Collections.Artists, 'artist_id', this.artistId);
    } else {
      this.clearForm();
    }
  }

  clearForm() {
    this.artistForm.reset();
  }

  populateData() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.artistForm.get('artist_id')?.setValue(this.dbData.artist_id);
    this.artistForm.get('name')?.setValue(this.dbData.name);
    this.artistForm.get('photo_path')?.setValue(this.dbData.photo_path);
  }

  init(): void {
    this.artistId = Date.now();
    this.editMode = false;

    const artistId = this.route.snapshot.paramMap.get('id');
    if (artistId) {
      this.artistId = +artistId;
      this.editMode = true;
      this.headerData.data.headerTitle = 'Edit Artist';
    }

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

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
