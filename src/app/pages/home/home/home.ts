import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Logout } from '../../../components/signout/logout/logout';
import { StorageService } from '../../../admin/service/storgeService';
@Component({ selector: 'app-home', imports: [RouterOutlet, RouterLink, RouterLinkActive, Logout], templateUrl: './home.html', styleUrl: './home.css', host: { class: 'portal-layout' }, changeDetection: ChangeDetectionStrategy.OnPush })
export class Home {
  readonly userName = String(inject(StorageService).getItem('userCredentials')?.UserName ?? '').trim();
}
