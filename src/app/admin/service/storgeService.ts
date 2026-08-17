import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private secretKey = 'my-secret-key-123';

  setItem(key: string, value: any) {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      this.secretKey
    ).toString();

    localStorage.setItem(key, encrypted);
  }


  getItem(key: string) {
    const encrypted = localStorage.getItem(key);

    if (!encrypted) return null;

    const decrypted = CryptoJS.AES.decrypt(
      encrypted,
      this.secretKey
    ).toString(CryptoJS.enc.Utf8);

    return JSON.parse(decrypted);
  }


  removeItem(key: string) {
    localStorage.removeItem(key);
  }
}