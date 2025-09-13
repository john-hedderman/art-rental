import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { Client, HeaderButton } from '../../../model/models';
import { PageHeaderService } from '../../../service/page-header-service';
import { ClientService } from '../../../service/client-service';

@Component({
  selector: 'app-client-detail',
  imports: [],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss',
  standalone: true,
})
export class ClientDetail implements OnInit {
  clientData: Client = {} as Client;

  headerTitle = 'Client detail';
  navigateToClientList = () => {
    this.router.navigate(['/clients', 'list']);
  };
  headerButtons: HeaderButton[] = [
    {
      id: 'returnToClientListBtn',
      label: '<i class="bi bi-arrow-left"></i> Back',
      type: 'button',
      buttonClass: 'btn btn-primary',
      disabled: false,
      clickHandler: this.navigateToClientList,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pageHeaderService: PageHeaderService,
    private clientService: ClientService
  ) {}

  getClientId(): Observable<string> {
    return this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');
        return id !== null ? id : '';
      })
    );
  }

  ngOnInit(): void {
    this.getClientId()
      .pipe(
        switchMap((id) => {
          return this.clientService.getClient(id);
        }),
        take(1)
      )
      .subscribe((client) => {
        this.clientData = client;
        this.pageHeaderService.send({
          headerTitle: client?.name,
          headerButtons: this.headerButtons,
        });
      });
  }
}
