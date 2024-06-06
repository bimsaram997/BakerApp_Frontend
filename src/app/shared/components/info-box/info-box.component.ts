import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.css']
})
export class InfoBoxComponent {
  constructor(
    public dialogRef: MatDialogRef<InfoBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  get dialogTitle(): string {
    return this.data.title || 'Dialog Title';
  }

  get dialogText(): string {
    return this.data.text || 'Dialog Text';
  }

  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}
