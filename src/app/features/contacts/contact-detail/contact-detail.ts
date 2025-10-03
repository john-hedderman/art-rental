import { Component } from '@angular/core';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Client, HeaderData } from '../../../model/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-detail',
  imports: [PageHeader],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
  standalone: true,
})
export class ContactDetail {
  navigateToContactList = () => {
    this.router.navigate(['/contacts', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Contact detail',
    headerButtons: [
      {
        id: 'returnToContactListBtn',
        label: 'Contact list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToContactList,
      },
    ],
  };

  constructor(private router: Router) {}
}
