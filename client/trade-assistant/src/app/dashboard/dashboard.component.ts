import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DashboardComponent {
  constructor(private auth: AuthService) {}

  isAdminOrModerator(): boolean {
    const token = this.auth.getToken();
    if (!token) return false;
    const decoded: any = this.auth.decodeToken(token);
    return decoded.role === 'admin' || decoded.role === 'moderator';
  }
}
