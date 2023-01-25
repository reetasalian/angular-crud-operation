import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Client } from '../../models/client';

@Component({
  selector: 'app-edit.dialog',
  templateUrl: './edit.dialog.component.html',
  styleUrls: ['./edit.dialog.component.css'],
})
export class EditDialogComponent {
  reactiveForm!: FormGroup;
  client: Client;

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dataService: DataService
  ) {}

  ngOnInit() {
    this.reactiveForm = new FormGroup({
      name: new FormControl(this.data.name, [Validators.required]),
      email: new FormControl(this.data.email, [Validators.required]),
      phone_no: new FormControl(this.data.phone_no, [Validators.required]),
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
    console.info('updated client:', this.client);
    this.dataService.updateClient(this.client);
  }
}
