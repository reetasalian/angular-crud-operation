import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-delete.dialog',
  templateUrl: './delete.dialog.component.html',
  styleUrls: ['./delete.dialog.component.css'],
})
export class DeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dataService: DataService
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  confirmDelete(): void {
    this.dataService.deleteClient(this.data.name);
  }
}
