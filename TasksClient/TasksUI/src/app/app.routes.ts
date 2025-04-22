import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./core/features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  { // <-- NEW Route for Tasks
    path: 'tasks',
    loadComponent: () => import('./core/tasks/task-list/task-list.component').then(m => m.TaskListComponent),
  },

  {
    path: '',
    redirectTo: '/dashboard', // Default route
    pathMatch: 'full'
  },
  {
    path: '**', // Wildcard route for 404
    redirectTo: '/dashboard' // Or a dedicated NotFoundComponent
  }
];
export { Routes };

