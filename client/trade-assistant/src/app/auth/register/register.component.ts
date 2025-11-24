import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  phone = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private auth: AuthService, private router: Router) { }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.register({ name: this.name, email: this.email, password: this.password, phone: this.phone })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Account created! Please login.';
        },
        error: err => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed';
        }
      });
  }
}
