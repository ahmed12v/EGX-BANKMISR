export interface masterrequest{
    MasterType:string,
    UserId:string,
    UserPwd:string
}
export interface masterList {
  Code: string
  Description: string
  Response: masterListResponse[]
}

export interface masterListResponse {
  cl_Amt1: any
  cl_Amt2: any
  cl_Category: any
  cl_CodeID: string
  cl_CodeName: string
  cl_CodeType: any
  cl_Desc1: any
  cl_Desc2: any
  cl_Desc3: any
  cl_EffectDate: any
  cl_IsActive: any
  cl_Note: any
}
///////////////////////////////////////////////
export interface registerNumberReq{
    AccountNo:string,
    CustomerCode:string,
    UserID:string,
    UserPwd:string
}
export interface registrationNumber {
  BookingNo: string
  Code: string
  Message: string
}
/////////////////////////////////////////////////

export interface customerDetialsReq {
  AccountNo: string
  UserID: string
  UserPwd: string
}
export interface CustomerDetailsCome {
  Code: string
  CustomerDetails: CustomerDetails
  Description: string
}

export interface CustomerDetails {
  cl_AWBNoFr: any
  cl_AWBNoTo: any
  cl_AccCode: string
  cl_AccType: any
  cl_Active: any
  cl_AgentCode: any
  cl_AlertType: any
  cl_BankName: any
  cl_Blocked: any
  cl_BudgetAmt: any
  cl_BudgetType: any
  cl_CPerson: string
  cl_ContractAmt: any
  cl_CrDays: any
  cl_CrLimit: any
  cl_CreatedUser: any
  cl_Currency: any
  cl_CustAMail: any
  cl_CustAddress: string
  cl_CustAddress1: string
  cl_CustAddress2: string
  cl_CustAlert: any
  cl_CustCity: string
  cl_CustCode: string
  cl_CustCountry: string
  cl_CustEMail: string
  cl_CustFax: string
  cl_CustLocation: string
  cl_CustMobile: string
  cl_CustName: string
  cl_CustNote: string
  cl_CustPOBox: string
  cl_CustPhone: string
  cl_CustType: any
  cl_CustWebSite: any
  cl_Department: any
  cl_Designation: any
  cl_DivCode: any
  cl_ExportName: any
  cl_FSC: any
  cl_GPA: any
  cl_Hub: any
  cl_LicenseNo: any
  cl_OprTiming: any
  cl_PayMode: any
  cl_Route: any
  cl_SManCode: any
  cl_SaleArea: any
  cl_SignDate: any
  cl_Star: any
  cl_TariffAc: string
  cl_TaxRegNo: any
  cl_VAT: any
  cl_iConnect: any
}

//////////////////////////////////////////////////
export interface ComplaintRequest {
  UserID: string;
  UserPwd: string;
  ComplaintData: ComplaintData;
}

export interface ComplaintData {
  cl_CoREG: string;
  cl_CoDate: string;
  cl_empcode1: string;
  cl_empcode: string;
  cl_AWBNO: string;
  cl_Act: string;
  cl_AssignTo: string;
  cl_Car: string;
  cl_CarNo: string;
  cl_ClientCode: string;
  cl_CustName: string;
  cl_EnqRefNo: string;
  cl_Lev: string;
  cl_Remarks: string;
  cl_Root: string;
  cl_Status: string;
  cl_cPerson: string;
  cl_complaint: string;
  cl_email: string;
  cl_sri: string;
  cl_tel: string;
}
export interface RootDone {
  BookingNo: string
  Code: string
  Description: string
}