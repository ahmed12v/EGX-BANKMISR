import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpinneLloading } from './components/spinner/spinne-lloading/spinne-lloading';
import { Logout } from './components/signout/logout/logout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet ,SpinneLloading , Logout],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BankIssue');
}
