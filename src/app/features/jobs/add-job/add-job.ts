import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { HeaderData } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-add-job',
  imports: [PageHeader],
  templateUrl: './add-job.html',
  styleUrl: './add-job.scss',
  standalone: true,
})
export class AddJob {
  navigateToJobList = () => {
    this.router.navigate(['/jobs', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Job',
    headerButtons: [
      {
        id: 'returnToJobListBtn',
        label: 'Job list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToJobList,
      },
    ],
  };

  constructor(private router: Router) {}
}
