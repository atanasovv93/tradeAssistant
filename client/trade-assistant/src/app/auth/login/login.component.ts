import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.loading) return;
    this.loading = true;
    this.message = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.auth.saveToken(res.access_token);
        this.message = '✅ Успешна најава!';
        this.loading = false;
        if (this.auth.isLoggedIn()) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.message = '❌ Неточни податоци.';
        this.loading = false;
      },
    });
  }
}
