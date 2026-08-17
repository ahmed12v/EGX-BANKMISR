import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TrackInfoRes, TrackingAWBReq } from "../interfaces/trackResponse";
import { Observable } from "rxjs";
import { searchPanelReq, TrackingResponseSearchawb } from "../interfaces/searchPanel";

@Injectable({
  providedIn: 'root',
})
export class trackingNow{
    private http = inject(HttpClient)

    trackawb(reqBody:TrackingAWBReq):Observable<TrackInfoRes>{
        return this.http.post<TrackInfoRes>
        ('https://egxpress.me/IconnectSecure/IntegraOntrackService.svc/TrackDetails', reqBody)

    }
  
    trackByshipperref(reqBody:searchPanelReq):Observable<TrackingResponseSearchawb>{
    return this.http.post<TrackingResponseSearchawb>
    (`https://egxpress.me/IconnectSecure/IntegraOntrackService.svc/AWBSearchDetailed`,reqBody)
    }
    
}