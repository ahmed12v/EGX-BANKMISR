export function isAllowedAccount(account: string | null | undefined): boolean {
  return ['dh02043', 'd77777'].includes((account ?? '').trim().toLowerCase());
}
