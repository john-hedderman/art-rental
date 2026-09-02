import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { delay, map, Observable, Subject, take, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';

import { AddBase } from '../../../shared/components/base/add-base/add-base';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { PageFooter } from '../../../shared/components/page-footer/page-footer';
import { IArt, IArtist, IJob } from '../../../model/models';
import { ActionLink, FooterActions, HeaderActions } from '../../../shared/actions/action-data';
import { SaveButton } from '../../../shared/buttons/save-button';
import { ResetButton } from '../../../shared/buttons/reset-button';
import { CancelButton } from '../../../shared/buttons/cancel-button';
import { Collections } from '../../../shared/enums/collections';
import { selectArtists, selectJobs } from '../../../core/+state/core.selectors';
import { ArtActions, CoreDataActions } from '../../../core/+state/core.actions';
import { selectArtById } from '../../art-store-page/+state/art-store.selectors';

@Component({
  selector: 'app-add-art-store',
  imports: [PageHeader, ReactiveFormsModule, AsyncPipe, PageFooter],
  templateUrl: './add-art-store.html',
  styleUrl: './add-art-store.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true
})
export class AddArtStore extends AddBase implements OnInit, OnDestroy {
  @ViewChild('fileNameTBD') fileNameTBD: ElementRef | undefined;

  private readonly destroy$ = new Subject<void>();

  goToArtList = () => this.router.navigate(['/art-store', 'list']);
  artListLink = new ActionLink('artListLink', 'Art', '/art-store/list', '', this.goToArtList);
  headerData = new HeaderActions('art-add', 'Add Art', [], [this.artListLink.data]);
  footerData = new FooterActions([new SaveButton(), new ResetButton(), new CancelButton()]);

  artForm!: FormGroup;

  dbData: IArt = {} as IArt;

  submitted = false;

  editMode = false;

  saveStatus = '';

  artItem$: Observable<IArt>;
  artists$: Observable<IArtist[]>;
  jobs$: Observable<IJob[]>;

  jobs: IJob[] = [];

  artId!: number;

  onClickReset() {
    this.resetForm();
  }

  resetForm() {
    this.submitted = false;
    if (this.editMode) {
      this.populateForm<IArt>(Collections.Art, 'art_id', this.artId);
    } else {
      this.clearForm();
    }
  }

  clearForm() {
    this.artForm.reset();
    const filenameTBDEl = this.fileNameTBD?.nativeElement as HTMLInputElement;
    filenameTBDEl.checked = false;
    this.artForm.get('file_name')?.enable();
  }

  onSelectFileNameTBD() {
    const checkboxEl = this.fileNameTBD?.nativeElement as HTMLInputElement;
    if (checkboxEl.checked) {
      this.artForm.get('file_name')?.setValue('');
      this.artForm.get('file_name')?.disable();
    } else {
      this.artForm.get('file_name')?.enable();
    }
  }

  onSubmit() {
    this.submitForm(this.artForm, ['art', 'jobs'], 'art');
  }

  async save(): Promise<string> {
    this.saveArt();
    // FIXME: dummy return for now - will update all other pages' save() methods to be similar, relying on state.opStatus
    return '';
  }

  saveArt() {
    this.artItem$.pipe(take(1), withLatestFrom(this.jobs$)).subscribe(([art, jobs]) => {
      const oldJobId = this.editMode ? art.job_id : undefined;
      const newJobId = +this.artForm.value.job_id;
      const oldJob = jobs.find((job) => job.job_id === oldJobId)!;
      const oldJobItem = { ...oldJob } as IJob;
      const newJob = jobs.find((job) => job.job_id === newJobId)!;
      const newJobItem = { ...newJob } as IJob;
      this.store.dispatch(
        ArtActions.addOrEditArt({
          isEdit: this.editMode,
          artItem: this.artForm.value,
          oldJobItem,
          newJobItem
        })
      );
    });
  }

  preSave() {
    this.disableSaveBtn();
    // const artId = this.route.snapshot.paramMap.get('id');
    // this.artId = artId ? +artId : Date.now();
    this.artForm.get('art_id')?.setValue(this.artId);
    this.artForm.value.artist_id = parseInt(this.artForm.value.artist_id);
    this.artForm.value.job_id = parseInt(this.artForm.value.job_id);
    const filenameTBDEl = this.fileNameTBD?.nativeElement as HTMLInputElement;
    if (filenameTBDEl.checked) {
      this.artForm.value.file_name = 'no-image-available.jpg';
    }
  }

  populateData() {
    // this also effectively touches the form fields, so the prepopulated fields that
    // the user has never touched can be considered valid, letting the form submission complete
    this.artItem$.pipe(delay(100), take(1)).subscribe((artItem) => {
      this.artForm.get('art_id')?.setValue(artItem.art_id);
      this.artForm.get('title')?.setValue(artItem.title);

      const filenameTBDEl = this.fileNameTBD?.nativeElement as HTMLInputElement;
      if (artItem.file_name === 'no-image-available.jpg') {
        filenameTBDEl.checked = true;
        this.artForm.get('file_name')?.setValue('');
        this.artForm.get('file_name')?.disable();
      } else {
        filenameTBDEl.checked = false;
        this.artForm.get('file_name')?.enable();
        this.artForm.get('file_name')?.setValue(artItem.file_name);
      }

      this.artForm.get('full_size_image_url')?.setValue(artItem.full_size_image_url);
      this.artForm.get('artist_id')?.setValue(artItem.artist_id);
      this.artForm.get('job_id')?.setValue(artItem.job_id);
    });
  }

  setArtId() {
    this.artId = Date.now();
    this.editMode = false;
    const artId = this.route.snapshot.paramMap.get('id');
    if (artId) {
      this.artId = +artId;
      this.editMode = true;
      this.headerData.data.headerTitle = 'Edit Art';
    }
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store
  ) {
    super();
    this.artists$ = this.store
      .select(selectArtists)
      .pipe(map((artists: IArtist[]) => [...artists].sort((a, b) => a.name.localeCompare(b.name))));
    this.jobs$ = this.store.select(selectJobs).pipe(
      map((jobs: IJob[]) => {
        return [...jobs].sort((a, b) => a.job_number.localeCompare(b.job_number));
      })
    );

    this.setArtId();
    this.artItem$ = this.store.select(selectArtById(this.artId));
  }

  ngOnInit(): void {
    this.store.dispatch(CoreDataActions.loadAllData({ refresh: true }));

    this.artForm = this.fb.group({
      art_id: this.artId,
      title: [''],
      file_name: [''],
      full_size_image_url: [''],
      tag_ids: this.fb.array([]),
      artist_id: [null],
      job_id: [null]
    });

    if (this.editMode) {
      this.populateForm<IArt>(Collections.Art, 'art_id', this.artId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
