import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { StorageService } from '../../../admin/service/storgeService';
import { LoginService } from '../../../admin/service/loginservice';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule , ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  
  //#region Declarations&injection
  isLoading = signal(false);
  cradentionalInvalid = signal('');
  showPassword = false;
  _loginService=inject(LoginService);
  route =inject(Router)
  _storageService = inject(StorageService);
  //#endregion

  //#region LoginForm
   loginForm :FormGroup =new FormGroup({
   UserID: new FormControl('',[Validators.required]),
   UserPwd: new FormControl('',[Validators.required]),
   })
  //#endregion

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  loginNow() {
  //console.log('loginNow called');

  if (this.loginForm.valid) {
    this.isLoading.set(true);
    //console.log('isLoading true')
    this._loginService.login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (res) =>{
          this.isLoading.set(false);
          if(res.Description ==="Invalid Credentials"){
           this.cradentionalInvalid.set(res.Description);
          }
          if(res.Description ==="SUCCESS"){
          this._storageService.setItem('userCredentials', res.UserCredentials);
          //const user = this._storageService.getItem('userCredentials');
          //console.log('User credentials stored in local storage:', user);
          }
          if(res.Description ==="SUCCESS"){
          this.route.navigate(['/home']);
          }
        } ,
        error: (err)=> this.isLoading.set(false)
         
      });
  }
}

}
