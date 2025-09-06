import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { HeaderButton } from '../../../model/models';
import { PageHeader } from '../../../components/page-header/page-header';

@Component({
  selector: 'app-client-detail',
  imports: [PageHeader],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss',
  standalone: true,
})
export class ClientDetail implements OnInit {
  clientId: string | null = '';

  headerTitle = '';

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

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.clientId = params.get('id');
      this.headerTitle = `Client ${this.clientId}`;
    });
  }
}
