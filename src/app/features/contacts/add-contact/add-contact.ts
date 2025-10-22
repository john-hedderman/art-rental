import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { HeaderData } from '../../../model/models';
import { AddEditContact } from '../add-edit-contact/add-edit-contact';

@Component({
  selector: 'app-add-contact',
  imports: [PageHeader, AddEditContact],
  templateUrl: './add-contact.html',
  styleUrl: './add-contact.scss',
  standalone: true,
})
export class AddContact {
  goToContactList = () => {
    this.router.navigate(['/contacts', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Contact',
    headerButtons: [
      {
        id: 'goToContactListBtn',
        label: 'Contact list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.goToContactList,
      },
    ],
    headerLinks: [],
  };

  constructor(private router: Router) {}
}
