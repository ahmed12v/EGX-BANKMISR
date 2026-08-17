import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { StorageService } from "../../admin/service/storgeService";

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const storageService = inject(StorageService);
  const userData = storageService.getItem("userCredentials");
  if (!userData) {
    return router.createUrlTree(["/login"]);
  }
  // Check user data
  if (!userData.UserID || !userData.CoCode) {
    localStorage.clear();
    return router.createUrlTree(["/login"]);
  }
  return true;
};