import { ChangeDetectionStrategy } from '@angular/core';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpinneLloading } from './components/spinner/spinne-lloading/spinne-lloading';
import { Logout } from './components/signout/logout/logout';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet ,SpinneLloading],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BankIssue');
}
