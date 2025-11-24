import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'];
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const decoded: any = this.auth.decodeToken(token); // додај decodeToken во AuthService
    if (!expectedRoles.includes(decoded.role)) {
      this.router.navigate(['/dashboard']); // redirect ако нема дозвола
      return false;
    }

    return true;
  }
}
