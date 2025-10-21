import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { HeaderData } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Collections } from '../../../shared/enums/collections';
import { DataService } from '../../../service/data-service';

@Component({
  selector: 'app-add-artist',
  imports: [PageHeader, ReactiveFormsModule],
  templateUrl: './add-artist.html',
  styleUrl: './add-artist.scss',
  standalone: true,
})
export class AddArtist implements OnInit {
  goToArtistList = () => {
    this.router.navigate(['/artists', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Artist',
    headerButtons: [
      {
        id: 'goToArtistListBtn',
        label: 'Artist list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.goToArtistList,
      },
    ],
  };

  artistForm!: FormGroup;
  submitted = false;
  artist_id!: number;

  onSubmit() {
    this.artistForm.value.artist_id = Date.now();
    this.submitted = true;
    this.saveArtist(this.artistForm.value);
    this.resetForm();
  }

  saveArtist(artistData: any) {
    const collectionName = Collections.Artists;
    this.dataService.saveDocument(artistData, collectionName);
  }

  resetForm() {
    this.artistForm.reset();
    this.submitted = false;
  }

  constructor(private router: Router, private fb: FormBuilder, private dataService: DataService) {
    this.artist_id = Date.now();
  }

  ngOnInit(): void {
    this.artistForm = this.fb.group({
      artist_id: this.artist_id,
      name: [''],
      photo_path: [''],
      tags: [''],
    });
  }
}
