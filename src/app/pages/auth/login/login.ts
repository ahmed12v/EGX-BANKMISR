import { ChangeDetectionStrategy } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { StorageService } from '../../../admin/service/storgeService';
import { LoginService } from '../../../admin/service/loginservice';
import { CommonModule } from '@angular/common';
import { isAllowedAccount } from '../../../core/guards/allowed-account';
import { isCrmAccount } from '../../../core/guards/crm-guard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  //#region Declarations&injection
  isLoading = signal(false);
  cradentionalInvalid = signal('');
  showPassword = signal(false);
  _loginService = inject(LoginService);
  route = inject(Router);
  _storageService = inject(StorageService);
  //#endregion

  //#region LoginForm
  loginForm: FormGroup = new FormGroup({
    UserID: new FormControl('', [Validators.required]),
    UserPwd: new FormControl('', [Validators.required]),
  });
  //#endregion

  togglePassword(): void {
    this.showPassword.update((show) => !show);
  }

  loginNow() {
    //console.log('loginNow called');

    if (this.loginForm.valid) {
      this.cradentionalInvalid.set('');
      const { UserID, UserPwd } = this.loginForm.getRawValue();
      if (isCrmAccount(UserID)) {
        if (UserPwd !== 'CRM12345') {
          this._storageService.removeItem('userCredentials');
          this.cradentionalInvalid.set('Invalid Credentials');
          return;
        }
        this._storageService.setItem('userCredentials', {
          UserID: 'CRM@EGYPTEXPRESS',
          UserName: 'CRM',
          authSource: 'local-crm',
          credentialsVerified: true,
        });
        this.route.navigate(['/dashboard']);
        return;
      }
      this.isLoading.set(true);
      //console.log('isLoading true')
      this._loginService
        .login(this.loginForm.value)
        .pipe(
          finalize(() => {
            this.isLoading.set(false);
          }),
        )
        .subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.Description === 'Invalid Credentials') {
              this.cradentionalInvalid.set(res.Description);
            }
            if (res.Description === 'SUCCESS') {
              if (isCrmAccount(res.UserCredentials?.UserID) || !isAllowedAccount(res.UserCredentials?.CoCode)) {
                this._storageService.removeItem('userCredentials');
                this.cradentionalInvalid.set(
                  'This account is not authorized to access this portal.',
                );
                return;
              }
              this._storageService.setItem('userCredentials', res.UserCredentials);
              //const user = this._storageService.getItem('userCredentials');
              //console.log('User credentials stored in local storage:', user);
            }
            if (res.Description === 'SUCCESS') {
              this.route.navigate(['/home']);
            }
          },
          error: (err) => this.isLoading.set(false),
        });
    }
  }
}
