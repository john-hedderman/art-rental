import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { PageHeader } from '../../../shared/components/page-header/page-header';
import { HeaderData } from '../../../model/models';

@Component({
  selector: 'app-add-client',
  imports: [PageHeader, ReactiveFormsModule],
  templateUrl: './add-client.html',
  styleUrl: './add-client.scss',
  standalone: true,
})
export class AddClient implements OnInit {
  headerData: HeaderData = {
<<<<<<< HEAD
    headerTitle: 'Add Client',
=======
    headerTitle: 'Artists',
>>>>>>> 731a0d87a465b3f303bb2d32fefe4dc5cfd432f3
    headerButtons: [],
  };

  clientForm!: FormGroup;
  submitted = false;

  onSubmit() {
    this.submitted = true;
  }

  get clientContacts(): FormArray {
    return this.clientForm.get('clientContacts') as FormArray;
  }

  newContact(): FormGroup {
    return this.fb.group({
      contactFirstName: [''],
      contactLastName: [''],
      contactTitle: [''],
      contactPhone: [''],
    });
  }

  addContact(): void {
    this.clientContacts.push(this.newContact());
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      clientName: [''],
      clientAddress1: [''],
      clientAddress2: [''],
      clientCity: [''],
      clientState: [''],
      clientZip: [''],
      clientContacts: this.fb.array([]),
    });
  }
}
