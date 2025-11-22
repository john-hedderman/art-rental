import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Artist } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/messages';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { SaveButton } from '../../../shared/components/save-button/save-button';
import { CancelButton } from '../../../shared/components/cancel-button/cancel-button';

@Component({
  selector: 'app-add-artist',
  imports: [PageHeader, ReactiveFormsModule, Buttonbar],
  templateUrl: './add-artist.html',
  styleUrl: './add-artist.scss',
  standalone: true,
})
export class AddArtist implements OnInit, OnDestroy {
  goToArtistList = () => this.router.navigate(['/artists', 'list']);

  artistListLink = new ActionLink(
    'artistListLink',
    'Artists',
    '/artists/list',
    '',
    this.goToArtistList
  );
  headerData = new HeaderActions('artist-add', 'Add Artist', [], [this.artistListLink.data]);
  footerData = new FooterActions([new SaveButton(), new CancelButton()]);

  artistForm!: FormGroup;
  submitted = false;

  saveStatus = '';

  artistDBData: Artist = {} as Artist;

  artistId!: number;
  editMode = false;

  reloadFromDb() {
    this.dataService
      .load('artists')
      .subscribe((artists) => this.dataService.artists$.next(artists));
  }

  showOpStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  resetOpStatus(status: string, desiredDelay?: number) {
    const delay = status === Const.SUCCESS ? desiredDelay : Const.CLEAR_ERROR_DELAY;
    this.showOpStatus('', '', '', delay);
  }

  async onSubmit() {
    this.submitted = true;
    if (this.artistForm.valid) {
      const id = this.editMode ? this.artistId : undefined;
      const field = this.editMode ? 'artist_id' : undefined;
      this.saveStatus = await this.operationsService.saveDocument(
        this.artistForm.value,
        Collections.Artists,
        id,
        field
      );
      this.showOpStatus(this.saveStatus, Msgs.SAVED_ARTIST, Msgs.SAVE_ARTIST_FAILED);
      this.resetOpStatus(this.saveStatus, Const.STD_DELAY);
      this.submitted = false;
      if (this.editMode) {
        this.populateForm();
      } else {
        this.artistForm.reset();
      }
      if (this.saveStatus === Const.SUCCESS) {
        this.reloadFromDb();
      }
    }
  }

  populateArtistData() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.artistForm.get('artist_id')?.setValue(this.artistDBData.artist_id);
    this.artistForm.get('name')?.setValue(this.artistDBData.name);
    this.artistForm.get('photo_path')?.setValue(this.artistDBData.photo_path);
    this.artistForm.get('tags')?.setValue(this.artistDBData.tags);
  }

  populateForm() {
    this.http
      .get<Artist[]>(`http://localhost:3000/data/artists/${this.artistId}?recordId=artist_id`)
      .subscribe((artists) => {
        if (artists && artists.length === 1) {
          this.artistDBData = artists[0];
          if (this.artistDBData) {
            this.populateArtistData();
          }
        }
      });
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dataService: DataService,
    private route: ActivatedRoute,
    private operationsService: OperationsService,
    private http: HttpClient
  ) {
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
      this.populateForm();
    }

    this.artistForm = this.fb.group({
      artist_id: this.artistId,
      name: [''],
      photo_path: [''],
      tags: [''],
    });
  }

  ngOnDestroy(): void {
    this.resetOpStatus('');
  }
}
