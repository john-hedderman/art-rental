import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { HeaderButton } from '../../../model/models';
import { PageHeaderService } from '../../../service/page-header-service';

@Component({
  selector: 'app-add-client',
  imports: [],
  templateUrl: './add-client.html',
  styleUrl: './add-client.scss',
  standalone: true,
})
export class AddClient implements OnInit {
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

  constructor(private router: Router, private pageHeaderService: PageHeaderService) {}

  ngOnInit(): void {
    this.pageHeaderService.sendData({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
  }
}
