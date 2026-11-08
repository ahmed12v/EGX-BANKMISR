import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { Login } from './login';
import { StorageService } from '../../../admin/service/storgeService';
import { LoginService } from '../../../admin/service/loginservice';
import { isVerifiedCrmSession, crmGuard } from '../../../core/guards/crm-guard';
const email = 'CRM@EGYPTEXPRESS';
describe('CRM credentials and guard', () => {
 const storage = { setItem: vi.fn(), removeItem: vi.fn(), getItem: vi.fn() };
 const router = { navigate: vi.fn(), createUrlTree: vi.fn(() => 'login') };
 beforeEach(() => { vi.clearAllMocks(); TestBed.configureTestingModule({providers: [{provide: StorageService, useValue: storage}, {provide: Router, useValue: router}, {provide: LoginService, useValue: { login: vi.fn() }}]}); });
 it('rejects an incorrect password and clears an old session', () => {
 const login = TestBed.runInInjectionContext(() => new Login()); login.loginForm.setValue({UserID: email, UserPwd: 'incorrect'}); login.loginNow();
 expect(storage.setItem).not.toHaveBeenCalled(); expect(router.navigate).not.toHaveBeenCalled(); expect(storage.removeItem).toHaveBeenCalled();
 });
 it('rejects an email-only session', () => { storage.getItem.mockReturnValue({UserID: email}); expect(TestBed.runInInjectionContext(() => crmGuard({} as never, {} as never))).toBe('login'); });
 it('requires a verified CRM login session', () => { expect(isVerifiedCrmSession({UserID: email, authSource:'local-crm', credentialsVerified:true})).toBe(true); expect(isVerifiedCrmSession({UserID:'other', authSource:'local-crm', credentialsVerified:true})).toBe(false); });
});
