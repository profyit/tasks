import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Task } from '../models/task.model'; // <-- Import Task model

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private taskUrl = `${this.apiUrl}/tasks`; // Specific endpoint for tasks

  // --- Dashboard Data ---
  getDashboardData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard-stats`).pipe(
      tap(data => console.log('Fetched dashboard data:', data)),
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  postSomeData(formData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/items`, formData).pipe(
      tap(response => console.log('Posted data response:', response)),
      catchError(this.handleError)
    );
  }

  // --- Task CRUD Operations ---

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.taskUrl).pipe(
      tap(tasks => console.log(`Fetched ${tasks.length} tasks`)),
      // Optional: Map due date string to Date object if needed
      map(tasks => tasks.map(task => ({ ...task, dueDate: new Date(task.dueDate) }))),
      catchError(this.handleError)
    );
  }

  addTask(task: Task): Observable<Task> {
    // Ensure isCompleted is set, default to false if not provided
    const newTask = { ...task, isCompleted: task.isCompleted ?? false };
    return this.http.post<Task>(this.taskUrl, newTask).pipe(
      tap(newTask => console.log(`Added task with id=${newTask.id}`)),
      catchError(this.handleError)
    );
  }

  updateTask(task: Task): Observable<any> {
    // API typically needs the ID in the URL for updates
    const url = `${this.taskUrl}/${task.id}`;
    return this.http.put(url, task).pipe(
      tap(_ => console.log(`Updated task id=${task.id}`)),
      catchError(this.handleError)
    );
  }

  deleteTask(id: string | number): Observable<Task> {
    const url = `${this.taskUrl}/${id}`;
    return this.http.delete<Task>(url).pipe(
      tap(_ => console.log(`Deleted task id=${id}`)),
      catchError(this.handleError)
    );
  }


  // --- Error Handling ---
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Server returned code ${error.status}, error message is: ${error.message}`;
       if (error.error && typeof error.error === 'object' && error.error.message) {
         errorMessage += ` Backend message: ${error.error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
