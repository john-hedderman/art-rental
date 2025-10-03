import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxDatatableModule, TableColumn, DatatableComponent } from '@swimlane/ngx-datatable';

import { Client, HeaderData } from '../../../model/models';
import { DataService } from '../../../service/data-service';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-client-list',
  imports: [NgxDatatableModule, PageHeader],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
  standalone: true,
  host: {
    class: 'd-flex flex-column h-100',
  },
})
export class ClientList implements OnInit {
  @ViewChild('clientsTable') table!: DatatableComponent<Client>;
  @ViewChild('arrowTemplate', { static: true }) arrowTemplate!: TemplateRef<any>;
  @ViewChild('locationHeaderTemplate', { static: true }) locationHeaderTemplate!: TemplateRef<any>;
  @ViewChild('locationTemplate', { static: true }) locationTemplate!: TemplateRef<any>;
  @ViewChild('businessHeaderTemplate', { static: true }) businessHeaderTemplate!: TemplateRef<any>;
  @ViewChild('businessTemplate', { static: true }) businessTemplate!: TemplateRef<any>;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  navigateToAddClient = () => {
    this.router.navigate(['/clients', 'add']);
  };
  headerData: HeaderData = {
    headerTitle: 'Clients',
    headerButtons: [
      {
        id: 'addClientBtn',
        label: 'Add Client',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.navigateToAddClient,
      },
    ],
  };

  rows: Client[] = [];
  columns: TableColumn[] = [];
  expanded: any = {};

  checkScreenSize() {
    let detailRows;
    if (window.innerWidth >= 768) {
      detailRows = document.querySelectorAll('.datatable-row-detail:not(.d-none)');
      detailRows.forEach((detailRow) => {
        detailRow.classList.add('d-none');
      });
    } else {
      detailRows = document.querySelectorAll('.datatable-row-detail.d-none');
      detailRows.forEach((detailRow) => {
        detailRow.classList.remove('d-none');
      });
    }
  }

  toggleExpandRow(row: Client) {
    this.table.rowDetail!.toggleExpandRow(row);
  }

  onActivate(event: any) {
    if (event.type !== 'click') {
      return;
    }
    if (event.cellIndex !== 0) {
      this.router.navigate(['/clients', event.row.id]);
    }
  }

  locationComparator(rowA: any, rowB: any): number {
    const locationA = `${rowA['city']}, ${rowA['state']}`;
    const locationB = `${rowB['city']}, ${rowB['state']}`;
    return locationA.localeCompare(locationB);
  }

  constructor(private dataService: DataService, private router: Router) {
    this.dataService.clients$.subscribe((clients) => {
      if (clients) {
        this.rows = [...clients];
      }
    });
  }

  ngOnInit(): void {
    this.columns = [
      {
        width: 50,
        resizeable: false,
        sortable: false,
        draggable: false,
        canAutoResize: false,
        cellTemplate: this.arrowTemplate,
      },
      { width: 300, prop: 'name', name: 'Name' },
      {
        width: 250,
        prop: '',
        name: 'Location',
        headerTemplate: this.locationHeaderTemplate,
        cellTemplate: this.locationTemplate,
        comparator: this.locationComparator,
      },
      {
        width: 200,
        prop: 'industry',
        name: 'Business',
        headerTemplate: this.businessHeaderTemplate,
        cellTemplate: this.businessTemplate,
      },
    ];
  }
}
