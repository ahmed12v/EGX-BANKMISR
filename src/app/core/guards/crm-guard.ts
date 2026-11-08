import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../../admin/service/storgeService';

export function isCrmAccount(userId: string | null | undefined): boolean {
  return (userId ?? '').trim().toLowerCase() === 'crm@egyptexpress';
}

export function isVerifiedCrmSession(user: { UserID?: string; authSource?: string; credentialsVerified?: boolean } | null | undefined): boolean {
  return isCrmAccount(user?.UserID) && user?.authSource === 'local-crm' && user.credentialsVerified === true;
}

export const crmGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const user = storage.getItem('userCredentials');
  if (isVerifiedCrmSession(user)) return true;
  if (isCrmAccount(user?.UserID)) storage.removeItem('userCredentials');
  return inject(Router).createUrlTree(['/login']);
};
