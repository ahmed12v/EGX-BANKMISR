import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { StorageService } from "../../admin/service/storgeService";
import { isAllowedAccount } from './allowed-account';
import { isCrmAccount, isVerifiedCrmSession } from './crm-guard';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const storageService = inject(StorageService);
  const userData = storageService.getItem("userCredentials");
  if (!userData) {
    return router.createUrlTree(["/login"]);
  }
  // Check user data
  if (isVerifiedCrmSession(userData)) return router.createUrlTree(['/dashboard']);
  if (isCrmAccount(userData.UserID)) {
    storageService.removeItem('userCredentials');
    return router.createUrlTree(['/login']);
  }
  if (!userData.UserID || !isAllowedAccount(userData.CoCode)) {
    storageService.removeItem('userCredentials');
    return router.createUrlTree(["/login"]);
  }
  return true;
};
