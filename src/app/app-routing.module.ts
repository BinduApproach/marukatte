import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthPageModule)
  },
  
  {
    path: 'bookings',
    loadChildren: () => import('./bookings/bookings.module').then( m => m.BookingsPageModule),
    canLoad: [AuthGuard]
  },

  {
    path: 'places',
    // loadChildren: () => import('./places/places.module').then( m => m.PlacesPageModule),
    loadChildren: './places/places.module#PlacesPageModule',
    canLoad: [AuthGuard]
  },
  {
    path: 'verify-email-address', loadChildren: './auth/verify-email/verify-email.module#VerifyEmailPageModule'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
