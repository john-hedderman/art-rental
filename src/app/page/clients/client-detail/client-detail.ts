import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { HeaderButton } from '../../../model/models';
import { PageHeaderService } from '../../../service/page-header-service';

@Component({
  selector: 'app-client-detail',
  imports: [],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss',
  standalone: true,
})
export class ClientDetail implements OnInit {
  clientId: string | null = '';

  headerTitle = 'Client detail';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pageHeaderService: PageHeaderService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.clientId = params.get('id');
      this.headerTitle = `Client ${this.clientId}`;
    });
    this.pageHeaderService.sendData({
      headerTitle: this.headerTitle,
      headerButtons: this.headerButtons,
    });
  }
}
