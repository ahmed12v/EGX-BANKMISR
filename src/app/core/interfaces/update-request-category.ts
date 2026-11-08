export const UPDATE_REQUEST_CODE = 'BMR';
export const UPDATE_REQUEST_NAME = 'BANK REQUEST';

export function isUpdateDone(statusCode: string | null | undefined): boolean {
  return statusCode?.trim().toUpperCase() === 'CC';
}

export function closeUpdateRequestQuery(registration: string, awb: string): string {
  if (!String(registration ?? '').trim() || !String(awb ?? '').trim()) throw new Error('Missing request identity.');
  const literal = (value: string) => "N'" + String(value).replace(/'/g, "''") + "'";
  const scope = `CoReg = ${literal(registration)} AND AWBNO = ${literal(awb)}
    AND ClientCode IN ('DH02043', 'D77777')
    AND UPPER(LTRIM(RTRIM(rootname))) = '${UPDATE_REQUEST_NAME}'`;
  return `SET NOCOUNT ON;
BEGIN TRY
  BEGIN TRANSACTION;
  IF (SELECT COUNT(*) FROM ComplaintRegView WITH (UPDLOCK, HOLDLOCK) WHERE ${scope}) <> 1
    THROW 50001, 'Expected exactly one bank update request.', 1;
  UPDATE ComplaintRegView SET Status = 'CC' WHERE ${scope};
  IF NOT EXISTS (SELECT 1 FROM ComplaintRegView WHERE ${scope} AND Status = 'CC')
    THROW 50002, 'Update request was not closed.', 1;
  COMMIT TRANSACTION;
  SELECT CoReg, AWBNO AS AirwayBillNo, Status AS StatusCode FROM ComplaintRegView WHERE ${scope};
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
  THROW;
END CATCH`;
}

export function isUpdateRequestCategory(value: string | null | undefined): boolean {
  const normalized = value?.trim().toUpperCase();
  return normalized === UPDATE_REQUEST_CODE || normalized === UPDATE_REQUEST_NAME;
}
