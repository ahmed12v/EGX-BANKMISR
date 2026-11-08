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
        (`/BANKMISR/complaint-types`,masterrequest)
    }
   //
    GetregisterNumber(registreReq:registerNumberReq):Observable<registrationNumber>{
        return this._http
        .post<registrationNumber>
        (`/BANKMISR/complaint-number`,registreReq)
    }
    GetNewregisterNumber(registreReq:registerNumberReq):Observable<registrationNumber>{
        return this._http
        .post<registrationNumber>
        (`/BANKMISR/complaint-number`,registreReq)
    }
    //

    GetCustomerDetials(customerDetialsReq:customerDetialsReq):Observable<CustomerDetailsCome>{
        return this._http
        .post<CustomerDetailsCome>
        (`/BANKMISR/account-details`,customerDetialsReq)
    }
    //
     addComplainNow(ComplaintRequest:ComplaintRequest):Observable<RootDone>{
        return this._http
        .post<RootDone>
        (`/BANKMISR/create-complaint`,ComplaintRequest)
    }

}