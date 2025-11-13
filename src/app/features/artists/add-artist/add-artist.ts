import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Artist, ButtonbarData, HeaderData } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { OperationsService } from '../../../service/operations-service';
import * as Constants from '../../../constants';

@Component({
  selector: 'app-add-artist',
  imports: [PageHeader, ReactiveFormsModule, Buttonbar],
  templateUrl: './add-artist.html',
  styleUrl: './add-artist.scss',
  standalone: true,
})
export class AddArtist implements OnInit {
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

  editObj: Artist = {} as Artist;
  editMode = false;

  artistForm!: FormGroup;
  submitted = false;

  artistId = '';

  saveStatus = '';

  async onSubmit() {
    let success = 'Artist saved';
    const failure = 'Save failed';
    const statusReset = { status: '', success: '', failure: '' };
    this.submitted = true;
    if (this.artistForm.valid) {
      if (this.editMode) {
        success = 'Changes saved';
        this.saveStatus = await this.saveDocument(this.artistForm.value);
        this.operationsService.setStatus({ status: this.saveStatus, success, failure });
        this.operationsService.setStatus(statusReset, 1500);
      } else {
        this.artistForm.value.artist_id = Date.now();
        this.saveStatus = await this.saveDocument(this.artistForm.value);
        this.operationsService.setStatus({ status: this.saveStatus, success, failure });
        this.operationsService.setStatus(statusReset, 1500);
        this.resetForm();
      }
      if (this.saveStatus === Constants.SUCCESS) {
        this.dataService
          .load('artists')
          .subscribe((artists) => this.dataService.artists$.next(artists));
      }
    }
  }

  async saveDocument(artistData: any): Promise<string> {
    const collectionName = Collections.Artists;
    let result = Constants.SUCCESS;
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
        result = Constants.FAILURE;
      }
    } catch (error) {
      console.error('Save error:', error);
      result = Constants.FAILURE;
    }
    return result;
  }

  resetForm() {
    if (this.editMode) {
      this.repopulateEditForm();
    } else {
      this.artistForm.reset();
    }
    this.submitted = false;
  }

  repopulateEditForm() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.artistForm.get('artist_id')?.setValue(this.editObj.artist_id);
    this.artistForm.get('name')?.setValue(this.editObj.name);
    this.artistForm.get('photo_path')?.setValue(this.editObj.photo_path);
    this.artistForm.get('tags')?.setValue(this.editObj.tags);
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dataService: DataService,
    private route: ActivatedRoute,
    private operationsService: OperationsService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.artistForm = this.fb.group({
      artist_id: [null],
      name: [''],
      photo_path: [''],
      tags: [''],
    });

    this.artistId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.artistId) {
      this.editMode = true;
      this.http
        .get<Artist[]>(`http://localhost:3000/data/artists/${this.artistId}?recordId=artist_id`)
        .subscribe((artists) => {
          if (artists && artists.length === 1) {
            this.editObj = artists[0];
            if (this.editObj) {
              this.repopulateEditForm();
            }
          }
        });
    } else {
      this.editMode = false;
    }
  }
}
