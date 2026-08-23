import { inject, Injectable } from "@angular/core";
import { ComplaintResponse, queryComeٍSearch } from "../interfaces/complain";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn:'root'
})
export class complainService{
     private http = inject(HttpClient)

    getcomplainStatus(formsearch:queryComeٍSearch):Observable<ComplaintResponse>{
        return this.http
        .post<ComplaintResponse>
        (`https://egxpress.me/IconnectSecure/IntegraOntrackService.svc/SearchQuery`,formsearch)
    }
}