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
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      phone: new FormControl(''),
      title: new FormControl(''),
      client: new FormControl('', Validators.required),
    });
  }
}
