import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ForexDashboardWidgetComponent } from './forex-dashboard-widget/forex-dashboard-widget.component';
import { CryptoDashboardWidgetComponent } from './crypto-dashboard-widget/crypto-dashboard-widget.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ForexDashboardWidgetComponent, CryptoDashboardWidgetComponent]
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
