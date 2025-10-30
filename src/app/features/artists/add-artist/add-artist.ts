import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Artist, ButtonbarData, HeaderData } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';
import { Buttonbar } from '../../../shared/components/buttonbar/buttonbar';
import { OperationsService } from '../../../service/operations-service';
import { OPERATION_SUCCESS, OPERATION_FAILURE } from '../../../shared/constants';
import { HttpClient } from '@angular/common/http';

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
  headerData: HeaderData = {
    headerTitle: 'Add Artist',
    headerButtons: [],
    headerLinks: [],
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
  artist_id!: number;

  artistId = '';

  saveStatus = '';

  async onSubmit() {
    this.submitted = true;
    if (this.artistForm.valid) {
      if (this.editMode) {
        this.saveStatus = await this.saveDocument(this.artistForm.value);
        this.operationsService.setStatus(this.saveStatus);
        setTimeout(() => {
          this.operationsService.setStatus('');
        }, 2000);
      } else {
        this.artistForm.value.artist_id = Date.now();
        this.saveStatus = await this.saveDocument(this.artistForm.value);
        this.operationsService.setStatus(this.saveStatus);
        setTimeout(() => {
          this.operationsService.setStatus('');
        }, 2000);
        this.resetForm();
      }
      if (this.saveStatus === OPERATION_SUCCESS) {
        this.dataService
          .load('artists')
          .subscribe((artists) => this.dataService.artists$.next(artists));
      }
    }
  }

  async saveDocument(artistData: any): Promise<string> {
    const collectionName = Collections.Artists;
    let result = OPERATION_SUCCESS;
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
        result = OPERATION_FAILURE;
      }
    } catch (error) {
      console.error('Save error:', error);
      result = OPERATION_FAILURE;
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
  ) {
    this.artist_id = Date.now();
  }

  ngOnInit(): void {
    this.artistForm = this.fb.group({
      artist_id: this.artist_id,
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
