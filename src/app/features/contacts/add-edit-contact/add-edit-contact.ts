import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-edit-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './add-edit-contact.html',
  styleUrl: './add-edit-contact.scss',
  standalone: true,
})
export class AddEditContact implements OnInit {
  contactForm!: FormGroup;

  ngOnInit(): void {
    this.contactForm = new FormGroup({
      contactFirstName: new FormControl('', Validators.required),
      contactLastName: new FormControl('', Validators.required),
      contactPhone: new FormControl(''),
      contactTitle: new FormControl(''),
      contactClient: new FormControl('', Validators.required),
    });
  }
}
