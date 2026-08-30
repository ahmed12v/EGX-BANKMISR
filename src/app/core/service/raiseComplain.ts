import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ComplaintRequest, CustomerDetailsCome, customerDetialsReq, masterList, masterrequest, registerNumberReq, registrationNumber, RootDone } from "../interfaces/raiseComplain";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class addComplainService{
    _http=inject(HttpClient)

    GetMasterlistComplain(masterrequest:masterrequest):Observable<masterList>{
        return this._http
        .post<masterList>
        (`https://egxpress.me/IconnectSecure/IntegraOntrackService.svc/MasterList`,masterrequest)
    }
   //
    GetregisterNumber(registreReq:registerNumberReq):Observable<registrationNumber>{
        return this._http
        .post<registrationNumber>
        (`https://egxpress.me/IconnectSecure/IntegraOntrackService.svc/GetNewComplaintNo`,registreReq)
    }
    GetNewregisterNumber(registreReq:registerNumberReq):Observable<registrationNumber>{
        return this._http
        .post<registrationNumber>
        (`https://egxpress.me/IconnectSecure/IntegraOntrackService.svc/GetNewComplaintNo`,registreReq)
    }
    //

    GetCustomerDetials(customerDetialsReq:customerDetialsReq):Observable<CustomerDetailsCome>{
        return this._http
        .post<CustomerDetailsCome>
        (`https://egxpress.me/IconnectSecure/IntegraOntrackService.svc/GetAccountDetails`,customerDetialsReq)
    }
    //
     addComplainNow(ComplaintRequest:ComplaintRequest):Observable<RootDone>{
        return this._http
        .post<RootDone>
        (`https://egxpress.me/IconnectSecure/IntegraOntrackService.svc/CreateComplaint`,ComplaintRequest)
    }

}