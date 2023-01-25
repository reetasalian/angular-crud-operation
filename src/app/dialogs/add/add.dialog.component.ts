import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { DataService } from '../../services/data.service';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Client } from '../../models/client';

@Component({
  selector: 'app-add.dialog',
  templateUrl: './add.dialog.component.html',
  styleUrls: ['./add.dialog.component.css'],
})
export class AddDialogComponent {
  reactiveForm!: FormGroup;
  client: Client;
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<AddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Client,
    public dataService: DataService,
    private fb: FormBuilder
  ) {
    this.client = {} as Client;
  }

  ngOnInit() {
    this.reactiveForm = new FormGroup({
      name: new FormControl(this.client.name, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      email: new FormControl(this.client.email, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      phone_no: new FormControl(this.client.phone_no, [
        Validators.required,
        Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'),
      ]),
    });
  }

  get name() {
    return this.reactiveForm.get('name')!;
  }

  get email() {
    return this.reactiveForm.get('email')!;
  }

  get phone_no() {
    return this.reactiveForm.get('phone_no')!;
  }

  getErrorMessage() {
    if (
      this.name.hasError('required') ||
      this.phone_no.hasError('required') ||
      this.email.hasError('required')
    ) {
      return 'You must enter a value';
    }
    if (this.email.hasError('pattern')) {
      return 'Please provide a valid email address';
    }
    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  public validate(): void {
    if (this.reactiveForm.invalid) {
      for (const control of Object.keys(this.reactiveForm.controls)) {
        this.reactiveForm.controls[control].markAsTouched();
      }
      return;
    }

    this.client = this.reactiveForm.value;
    console.info('Added client:', this.client);
    this.dataService.addClient(this.client);
  }
}
