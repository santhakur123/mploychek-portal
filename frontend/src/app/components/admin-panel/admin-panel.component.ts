import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { UserService, UserProfile } from '../../services/user.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  currentUser: User | null = null;
  users: UserProfile[] = [];
  
  loadingUsers = true;
  submitting = false;
  
  userForm!: FormGroup;
  showModal = false;
  isEditMode = false;
  editingUserId = '';
  
  errorMessage = '';
  successMessage = '';

  roles = ['General User', 'Admin'];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadUsers();
    this.initForm();
  }

  initForm(): void {
    this.userForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['General User', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.errorMessage = '';
    
    // Fetch users with simulated 1.5s (1500ms) delay to show skeleton loaders
    this.userService.getUsers(1500).subscribe({
      next: (data) => {
        this.users = data;
        this.loadingUsers = false;
      },
      error: (err) => {
        this.loadingUsers = false;
        this.errorMessage = err.error?.message || 'Failed to fetch user database.';
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editingUserId = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.showModal = true;
    
    this.userForm.reset({
      username: '',
      name: '',
      email: '',
      role: 'General User',
      password: ''
    });
    
    // Ensure password is required for new users
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    
    // Enable username since it's a new entry
    this.userForm.get('username')?.enable();
  }

  openEditModal(user: UserProfile): void {
    this.isEditMode = true;
    this.editingUserId = user.id;
    this.errorMessage = '';
    this.successMessage = '';
    this.showModal = true;

    this.userForm.reset({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });

    // Make password optional for editing, update validation logic
    this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();

    // Disable editing the username (used as unique key)
    this.userForm.get('username')?.disable();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Extract values, including disabled ones like username in edit mode
    const formValue = this.userForm.getRawValue();

    if (this.isEditMode) {
      // Edit User (delay 1000ms to show spinner)
      this.userService.updateUser(this.editingUserId, formValue, 1000).subscribe({
        next: () => {
          this.submitting = false;
          this.showModal = false;
          this.successMessage = `User '${formValue.name}' updated successfully.`;
          this.loadUsers();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err.error?.message || 'Failed to update user.';
        }
      });
    } else {
      // Add User (delay 1000ms to show spinner)
      this.userService.createUser(formValue, 1000).subscribe({
        next: () => {
          this.submitting = false;
          this.showModal = false;
          this.successMessage = `User '${formValue.name}' created successfully.`;
          this.loadUsers();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err.error?.message || 'Failed to create user.';
        }
      });
    }
  }

  deleteUser(user: UserProfile): void {
    if (user.id === this.currentUser?.id) {
      this.errorMessage = 'Operation Denied: You cannot delete your own logged-in administrator account.';
      return;
    }

    if (confirm(`Are you sure you want to delete user '${user.name}'?`)) {
      this.loadingUsers = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Delete user with a 1000ms simulated delay
      this.userService.deleteUser(user.id, 1000).subscribe({
        next: () => {
          this.successMessage = `User '${user.name}' deleted successfully.`;
          this.loadUsers();
        },
        error: (err) => {
          this.loadingUsers = false;
          this.errorMessage = err.error?.message || 'Failed to delete user.';
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
