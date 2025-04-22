import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Import Checkbox
import { MatSort, MatSortModule } from '@angular/material/sort'; // Import Sort
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; // Import Paginator
import { MatFormFieldModule } from '@angular/material/form-field'; // For filter input
import { MatInputModule } from '@angular/material/input'; // For filter input
import { Subscription } from 'rxjs';

import { DataService } from '../../../core/services/data.service';
import { Task } from '../../../core/models/task.model';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component'; // Import the dialog component

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCheckboxModule, // Add Checkbox
    MatSortModule, // Add Sort
    MatPaginatorModule, // Add Paginator
    MatFormFieldModule, // Add FormField for filter
    MatInputModule, // Add Input for filter
    DatePipe // Add DatePipe for formatting dates in the template
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns: string[] = ['isCompleted', 'name', 'description', 'dueDate', 'actions'];
  dataSource = new MatTableDataSource<Task>([]); // Use MatTableDataSource
  isLoading = false;
  errorMessage: string | null = null;

  private dataService = inject(DataService);
  private dialog = inject(MatDialog);
  private tasksSubscription: Subscription = new Subscription;

  // For sorting and pagination
  @ViewChild(MatSort)
  sort: MatSort = new MatSort;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadTasks();
  }

  ngAfterViewInit(): void {
    // Connect sort and paginator to the data source
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  // Load tasks from the service
  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.tasksSubscription = this.dataService.getTasks().subscribe({
      next: (tasks) => {
        this.dataSource.data = tasks; // Assign data to the MatTableDataSource
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = `Error loading tasks: ${err.message}`;
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // Apply filter to the table
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage(); // Go to first page on filter
    }
  }

  // Open dialog for adding a new task
  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '450px', // Adjust width as needed
      data: { task: null } // Pass null for add mode
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Check if data was returned (Save clicked)
        console.log('Dialog result (add):', result);
        this.isLoading = true;
        this.dataService.addTask(result).subscribe({
          next: () => this.loadTasks(), // Reload tasks on success
          error: (err) => {
            this.errorMessage = `Error adding task: ${err.message}`;
            this.isLoading = false;
            console.error(err);
          }
        });
      }
    });
  }

  // Open dialog for editing an existing task
  openEditTaskDialog(task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '450px',
      data: { task: { ...task } } // Pass a copy of the task data for edit mode
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Check if data was returned (Update clicked)
        console.log('Dialog result (edit):', result);
        this.isLoading = true;
        this.dataService.updateTask(result).subscribe({
          next: () => this.loadTasks(), // Reload tasks on success
          error: (err) => {
            this.errorMessage = `Error updating task: ${err.message}`;
            this.isLoading = false;
            console.error(err);
          }
        });
      }
    });
  }

  // Handle task deletion
  deleteTask(taskId: string | number | undefined): void {
    if (!taskId) return; // Safety check

    // Optional: Add a confirmation dialog here
    if (confirm('Are you sure you want to delete this task?')) {
        this.isLoading = true;
        this.dataService.deleteTask(taskId).subscribe({
        next: () => this.loadTasks(), // Reload tasks on success
        error: (err) => {
            this.errorMessage = `Error deleting task: ${err.message}`;
            this.isLoading = false;
            console.error(err);
        }
        });
    }
  }

  // Handle toggling the completion status directly from the table
  toggleCompletion(task: Task): void {
      const updatedTask = { ...task, isCompleted: !task.isCompleted };
      this.isLoading = true; // Optional: show loading indicator during update
      this.dataService.updateTask(updatedTask).subscribe({
          next: () => {
              // Update the local data source directly for immediate UI feedback
              const index = this.dataSource.data.findIndex(t => t.id === task.id);
              if (index > -1) {
                  this.dataSource.data[index] = updatedTask;
                  // Trigger change detection for the table
                  this.dataSource._updateChangeSubscription();
              }
              this.isLoading = false;
          },
          error: (err) => {
              this.errorMessage = `Error updating task status: ${err.message}`;
              // Revert checkbox state on error
              task.isCompleted = !task.isCompleted;
              this.isLoading = false;
              console.error(err);
          }
      });
  }
}
