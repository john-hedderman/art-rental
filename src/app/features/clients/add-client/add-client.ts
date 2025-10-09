import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { HeaderData } from '../../../model/models';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-add-client',
  imports: [PageHeader, ReactiveFormsModule],
  templateUrl: './add-client.html',
  styleUrl: './add-client.scss',
  standalone: true,
})
export class AddClient implements OnInit {
  goToClientList = () => {
    this.router.navigate(['/clients', 'list']);
  };
  headerData: HeaderData = {
    headerTitle: 'Add Client',
    headerButtons: [
      {
        id: 'goToClientListBtn',
        label: 'Client list',
        type: 'button',
        buttonClass: 'btn btn-primary btn-sm',
        disabled: false,
        clickHandler: this.goToClientList,
      },
    ],
  };

  clientForm!: FormGroup;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.clientForm = new FormGroup({
      clientName: new FormControl(''),
      address: new FormGroup({
        address1: new FormControl(''),
        address2: new FormControl(''),
        city: new FormControl(''),
        state: new FormControl(''),
        zip: new FormControl(''),
      }),
    });
  }
}
