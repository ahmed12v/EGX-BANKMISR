import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoginRequest, LoginResponse } from '../interface/login';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiHttp = inject(HttpClient);
  


 login(body:LoginRequest ):Observable<LoginResponse> {
    return this.apiHttp.post<LoginResponse>
     (`/BANKMISR/login`,body);

  }


}