import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { HeaderButton, HeaderData } from '../../../model/models';
import { PageHeader2 } from '../../../shared/components/page-header-2/page-header-2';

@Component({
  selector: 'app-add-client',
  imports: [PageHeader2],
  templateUrl: './add-client.html',
  styleUrl: './add-client.scss',
  standalone: true,
})
export class AddClient {
  navigateToClientList = () => {
    this.router.navigate(['/clients', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Client',
    headerButtons: [
      {
        id: 'returnToClientListBtn',
        label: '<i class="bi bi-arrow-left"></i> Back',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToClientList,
      },
    ],
  };

  constructor(private router: Router) {}
}
