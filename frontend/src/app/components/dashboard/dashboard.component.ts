import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { RecordService, VerificationRecord } from '../../services/record.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  records: VerificationRecord[] = [];
  loadingRecords = true;
  submittingRecord = false;
  
  newRecordForm!: FormGroup;
  showAddModal = false;
  errorMessage = '';
  successMessage = '';

  verificationTypes = [
    'EPFO Work History Audit',
    'Academic Degree Audit',
    'E-Courts Litigation Scan',
    'UIDAI Identity Verification',
    'Credit History Check'
  ];

  riskLevels: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];

  constructor(
    private authService: AuthService,
    private recordService: RecordService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadRecords();

    this.newRecordForm = this.formBuilder.group({
      candidateName: ['', [Validators.required, Validators.minLength(2)]],
      type: ['EPFO Work History Audit', Validators.required],
      riskLevel: ['Low', Validators.required],
      notes: ['']
    });
  }

  loadRecords(): void {
    this.loadingRecords = true;
    this.errorMessage = '';
    
    // Request records with a simulated 1.5s (1500ms) delay to showcase async skeleton loader
    this.recordService.getRecords(1500).subscribe({
      next: (data) => {
        this.records = data;
        this.loadingRecords = false;
      },
      error: (err) => {
        this.loadingRecords = false;
        this.errorMessage = err.error?.message || 'Could not retrieve verification records.';
      }
    });
  }

  onSubmitRecord(): void {
    if (this.newRecordForm.invalid) {
      return;
    }

    this.submittingRecord = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newCheck = this.newRecordForm.value;

    // Simulate a 1000ms delay on creation
    this.recordService.createRecord(newCheck, 1000).subscribe({
      next: () => {
        this.submittingRecord = false;
        this.showAddModal = false;
        this.successMessage = 'Verification check requested successfully!';
        this.newRecordForm.reset({
          candidateName: '',
          type: 'EPFO Work History Audit',
          riskLevel: 'Low',
          notes: ''
        });
        this.loadRecords(); // Refresh the list
      },
      error: (err) => {
        this.submittingRecord = false;
        this.errorMessage = err.error?.message || 'Failed to submit verification check.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getCountByStatus(status: string): number {
    return this.records.filter(r => r.status === status).length;
  }
}
