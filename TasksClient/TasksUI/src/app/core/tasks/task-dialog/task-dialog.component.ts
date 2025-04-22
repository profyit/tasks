import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker'; // Import Datepicker
import { MatCheckboxModule } from '@angular/material/checkbox'; // Import Checkbox
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule, // Add Datepicker module
    MatCheckboxModule   // Add Checkbox module
  ],
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit {
  taskForm: FormGroup | any ;
  isEditMode: boolean;

  private fb = inject(FormBuilder);

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    // Inject data passed into the dialog (Task object for editing, or null for adding)
    @Inject(MAT_DIALOG_DATA) public data: { task: Task | null }
  ) {
    this.isEditMode = !!data?.task; // Determine if we are editing or adding
  }

  ngOnInit(): void {
    this.initForm();
  }

  // Initialize the reactive form
  initForm(): void {
    const taskData = this.data?.task;
    this.taskForm = this.fb.group({
      name: [taskData?.name || '', [Validators.required, Validators.minLength(3)]],
      description: [taskData?.description || '', Validators.required],
      dueDate: [taskData?.dueDate ? new Date(taskData.dueDate) : null, Validators.required], // Ensure dueDate is a Date object
      isCompleted: [taskData?.isCompleted || false] // Default to false if adding
    });
  }

  // Handle form submission
  onSave(): void {
    if (this.taskForm.valid) {
      const formData = this.taskForm.value;
      // Optionally include the ID if editing
      const resultData: Task = {
        ...this.data?.task, // Keep existing ID and other properties if editing
        ...formData,
         // Ensure dueDate is handled correctly (e.g., convert to ISO string if API expects that)
         // dueDate: formData.dueDate.toISOString()
      };
      this.dialogRef.close(resultData); // Close dialog and return the form data
    } else {
      // Mark fields as touched to show validation errors
      this.taskForm.markAllAsTouched();
    }
  }

  // Close the dialog without saving
  onCancel(): void {
    this.dialogRef.close(); // Close without returning data
  }

  // --- Form Control Getters ---
  get name() { return this.taskForm.get('name'); }
  get description() { return this.taskForm.get('description'); }
  get dueDate() { return this.taskForm.get('dueDate'); }
}
