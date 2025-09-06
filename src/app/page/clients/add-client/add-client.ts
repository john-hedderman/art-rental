import { Component } from '@angular/core';

import { PageHeader } from '../../../components/page-header/page-header';
import { Router } from '@angular/router';
import { HeaderButton } from '../../../model/models';

@Component({
  selector: 'app-add-client',
  imports: [PageHeader],
  templateUrl: './add-client.html',
  styleUrl: './add-client.scss',
  standalone: true,
})
export class AddClient {
  headerTitle = 'Add Client';

  navigateToClientList = () => {
    this.router.navigate(['/clients', 'list']);
  };

  headerButtons: HeaderButton[] = [
    {
      text: 'Return to List',
      type: 'button',
      buttonClass: 'btn btn-primary',
      clickHandler: this.navigateToClientList,
    },
  ];

  constructor(private router: Router) {}
}
