import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../../admin/service/storgeService';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.css',
})
export class Logout {
  isUserMenuOpen = false;
  _router = inject(Router)
  _storage= inject(StorageService)

toggleUserMenu(): void {
  this.isUserMenuOpen = !this.isUserMenuOpen;
}

logout(): void {
  this.isUserMenuOpen = false;

  // Logout logic
  this._router.navigate(['/login']);
  localStorage.removeItem('userCredentials')
}
}
