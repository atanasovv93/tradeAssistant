import { Routes } from '@angular/router';
import { HomeComponent } from './pages/homepage/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ArticleDetailsComponent } from './pages/article-details/article-details.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  // AUTH
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },


  // PUBLIC PAGES
  { path: 'news/:id', component: ArticleDetailsComponent },
  { path: 'product/:id', component: ProductDetailsComponent },

  // PROTECTED ROUTES
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],     // ⬅ Protect dashboard
    children: [
      {
        path: 'news',
        loadComponent: () =>
          import('./dashboard/news/news.component').then(m => m.NewsComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./dashboard/products/products.component').then(m => m.ProductsComponent)
      },
      { path: '', redirectTo: 'news', pathMatch: 'full' }
    ]
  },

  // REDIRECT WRONG URLs
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
