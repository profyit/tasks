import { Component as DashboardComponentTs, OnInit, inject } from '@angular/core'; // Renamed Component import
import { CommonModule as DashboardCommonModule } from '@angular/common';
import { ReactiveFormsModule as DashboardReactiveFormsModule, FormBuilder as DashboardFormBuilder, FormGroup as DashboardFormGroup, Validators as DashboardValidators } from '@angular/forms';
import { MatCardModule as DashboardMatCardModule } from '@angular/material/card';
import { MatFormFieldModule as DashboardMatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule as DashboardMatInputModule } from '@angular/material/input';
import { MatButtonModule as DashboardMatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule as DashboardMatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable as DashboardObservable } from 'rxjs';
import { DataService as DashboardDataService } from '../../services/data.service';

@DashboardComponentTs({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DashboardCommonModule, DashboardReactiveFormsModule, DashboardMatCardModule,
    DashboardMatFormFieldModule, DashboardMatInputModule, DashboardMatButtonModule,
    DashboardMatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private fb = inject(DashboardFormBuilder);
  private dataService = inject(DashboardDataService);
  dataForm: DashboardFormGroup;
  dashboardStats$ : DashboardObservable<any> = new DashboardObservable<any>;
  isLoading = false;
  errorMessage: string | null = null;
  submitMessage: string | null = null;

  constructor() {
    this.dataForm = this.fb.group({
      name: ['', [DashboardValidators.required, DashboardValidators.minLength(3)]],
      email: ['', [DashboardValidators.required, DashboardValidators.email]],
    });
  }
  ngOnInit(): void { this.loadDashboardData(); }
  loadDashboardData(): void {
    this.isLoading = true; this.errorMessage = null;
    this.dashboardStats$ = this.dataService.getDashboardData();
    this.dashboardStats$.subscribe({
        next: () => this.isLoading = false,
        error: (err) => { this.errorMessage = `Error loading dashboard data: ${err.message}`; this.isLoading = false; console.error(err); }
    });
  }
  onSubmit(): void {
    this.submitMessage = null; this.errorMessage = null;
    if (this.dataForm.valid) {
      this.isLoading = true; console.log('Form Submitted:', this.dataForm.value);
      this.dataService.postSomeData(this.dataForm.value).subscribe({
        next: (response) => { this.submitMessage = 'Data submitted successfully!'; console.log('API Response:', response); this.dataForm.reset(); this.isLoading = false; },
        error: (err) => { this.errorMessage = `Submission failed: ${err.message}`; this.isLoading = false; console.error(err); }
      });
    } else { console.log('Form is invalid'); this.dataForm.markAllAsTouched(); this.submitMessage = 'Please fix the errors in the form.'; }
  }
  get name() { return this.dataForm.get('name'); }
  get email() { return this.dataForm.get('email'); }
}
