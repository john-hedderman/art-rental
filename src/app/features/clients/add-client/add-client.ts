import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { HeaderData } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-add-client',
  imports: [PageHeader],
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
        label: '<i class="bi bi-arrow-left"></i> Client list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToClientList,
      },
    ],
  };

  constructor(private router: Router) {}
}
