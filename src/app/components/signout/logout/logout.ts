import { ChangeDetectionStrategy } from '@angular/core';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../../admin/service/storgeService';
import { awbStateService } from '../../../core/service/stats/awbstat';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.css',
})
export class Logout {
  _router = inject(Router);
  _storage = inject(StorageService);
  _abwstate = inject(awbStateService);

  logout(): void {
    this._abwstate.clear();
    this._storage.removeItem('userCredentials');
    this._router.navigate(['/login']);
  }
}
