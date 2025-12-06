import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Artist } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Collections } from '../../../shared/enums/collections';
import * as Msgs from '../../../shared/strings';
import {
  ActionButton,
  ActionLink,
  FooterActions,
  HeaderActions,
} from '../../../shared/actions/action-data';
import { SaveButton } from '../../../shared/components/save-button/save-button';
import { CancelButton } from '../../../shared/components/cancel-button/cancel-button';
import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { MessagesService } from '../../../service/messages-service';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { Util } from '../../../shared/util/util';

@Component({
  selector: 'app-add-artist',
  imports: [PageHeader, ReactiveFormsModule, PageFooter],
  providers: [MessagesService],
  templateUrl: './add-artist.html',
  styleUrl: './add-artist.scss',
  standalone: true,
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
  resetButton = new ActionButton(
    'resetBtn',
    'Reset',
    'button',
    'btn btn-outline-secondary ms-3',
    false,
    'modal',
    '#confirmModal',
    null
  );
  footerData = new FooterActions([new SaveButton(), this.resetButton, new CancelButton()]);

  artistForm!: FormGroup;
  submitted = false;

  saveStatus = '';

  dbData: Artist = {} as Artist;

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

  postSave() {
    this.messagesService.showStatus(
      this.saveStatus,
      Util.replaceTokens(Msgs.SAVED, { entity: 'artist' }),
      Util.replaceTokens(Msgs.SAVE_FAILED, { entity: 'artist' })
    );
    this.messagesService.clearStatus();
    this.resetForm();
    this.enableSaveBtn();
  }

  async onSubmit(): Promise<void> {
    this.submitForm(this.artistForm, ['artists']);
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
      this.populateForm<Artist>(Collections.Artists, 'artist_id', this.artistId);
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
    this.artistForm.get('tags')?.setValue(this.dbData.tags);
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private messagesService: MessagesService
  ) {
    super();
    const segments = this.route.snapshot.url.map((x) => x.path);
    if (segments[segments.length - 1] === 'edit') {
      this.headerData.data.headerTitle = 'Edit Artist';
    }
  }

  ngOnInit(): void {
    this.artistId = Date.now();
    this.editMode = false;

    const artistId = this.route.snapshot.paramMap.get('id');
    if (artistId) {
      this.artistId = +artistId;
      this.editMode = true;
      this.populateForm(Collections.Artists, 'artist_id', this.artistId);
    }

    this.artistForm = this.fb.group({
      artist_id: this.artistId,
      name: [''],
      photo_path: [''],
      tags: [''],
    });
  }

  ngOnDestroy(): void {
    this.messagesService.clearStatus();
  }
}
