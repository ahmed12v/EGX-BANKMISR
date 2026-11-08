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
  styleUrl: './app.css',
  host: {
    '(document:contextmenu)': 'disableContextMenu($event)',
    '(document:keydown)': 'disableDeveloperToolsShortcuts($event)',
  },
})
export class App {
  protected readonly title = signal('BankIssue');

 protected disableContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

protected disableDeveloperToolsShortcuts(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const windowsShortcut = event.ctrlKey && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key);
    const macShortcut = event.metaKey && event.altKey && ['i', 'j', 'c', 'k'].includes(key);
    if (key === 'f12' || windowsShortcut || macShortcut) {
      event.preventDefault();
    }
  }
}


