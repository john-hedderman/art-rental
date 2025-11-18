import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Artist, ButtonbarData, HeaderData } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { OperationsService } from '../../../service/operations-service';
import * as Const from '../../../constants';
import * as Msgs from '../../../shared/messages';

@Component({
  selector: 'app-add-artist',
  imports: [PageHeader, ReactiveFormsModule, Buttonbar],
  templateUrl: './add-artist.html',
  styleUrl: './add-artist.scss',
  standalone: true,
})
export class AddArtist implements OnInit, OnDestroy {
  goBack = () => {
    if (this.editMode) {
      this.router.navigate(['/artists', this.artistId]);
    } else {
      this.router.navigate(['/artists', 'list']);
    }
  };
  goToArtistsList = () => {
    this.router.navigate(['/artists', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Artist',
    headerButtons: [],
    headerLinks: [
      {
        id: 'goToArtistsListLink',
        label: 'Artists list',
        routerLink: '/artists/list',
        linkClass: '',
        clickHandler: this.goToArtistsList,
      },
    ],
  };

  buttonbarData: ButtonbarData = {
    buttons: [
      {
        id: 'saveBtn',
        label: 'Save',
        type: 'submit',
        buttonClass: 'btn btn-primary',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
        clickHandler: null,
      },
      {
        id: 'cancelBtn',
        label: 'Cancel',
        type: 'button',
        buttonClass: 'btn btn-outline-secondary ms-3',
        disabled: false,
        dataBsToggle: null,
        dataBsTarget: null,
        clickHandler: this.goBack,
      },
    ],
  };

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

  signalStatus(status: string, success: string, failure: string, delay?: number) {
    this.operationsService.setStatus({ status, success, failure }, delay);
  }

  signalArtistStatus() {
    this.signalStatus(this.saveStatus, Msgs.SAVED_ARTIST, Msgs.SAVE_ARTIST_FAILED);
  }

  signalResetStatus(delay?: number) {
    if (this.saveStatus === Const.SUCCESS) {
      this.signalStatus('', '', '', delay);
    }
  }

  async onSubmit() {
    this.submitted = true;
    if (this.artistForm.valid) {
      this.saveStatus = await this.saveDocument(this.artistForm.value);
      this.signalArtistStatus();
      this.signalResetStatus(1500);
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

  async saveDocument(artistData: any): Promise<string> {
    const collectionName = Collections.Artists;
    let result = Const.SUCCESS;
    try {
      let returnData;
      if (this.editMode) {
        returnData = await this.dataService.saveDocument(
          artistData,
          collectionName,
          artistData.artist_id,
          'artist_id'
        );
      } else {
        returnData = await this.dataService.saveDocument(artistData, collectionName);
      }
      if (returnData.modifiedCount === 0) {
        result = Const.FAILURE;
      }
    } catch (error) {
      console.error('Save error:', error);
      result = Const.FAILURE;
    }
    return result;
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
      this.headerData.headerTitle = 'Edit Artist';
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
    this.signalResetStatus(1500);
  }
}
