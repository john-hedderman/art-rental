import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HeaderButton } from '../../../model/models';
import { PageHeaderService } from '../../../service/page-header-service';

@Component({
  selector: 'app-add-job',
  imports: [],
  templateUrl: './add-job.html',
  styleUrl: './add-job.scss',
  standalone: true,
})
export class AddJob implements OnInit {
  headerTitle = 'Add Job';
  navigateToJobList = () => {
    this.router.navigate(['/jobs', 'list']);
  };
  headerButtons: HeaderButton[] = [
    {
      id: 'returnToJobListBtn',
      label: '<i class="bi bi-arrow-left"></i> Back',
      type: 'button',
      buttonClass: 'btn btn-primary btn-sm',
      disabled: false,
      clickHandler: this.navigateToJobList,
    },
  ];

  constructor(private router: Router, private pageHeaderService: PageHeaderService) {}

  ngOnInit(): void {
    this.pageHeaderService.send({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
  }
}
