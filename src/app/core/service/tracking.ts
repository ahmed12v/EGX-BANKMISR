import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TrackInfoRes, TrackingAWBReq } from "../interfaces/trackResponse";
import { Observable } from "rxjs";
import { HelpDataRequest, HelpDataResponse } from "../interfaces/searchPanel";
import { searchPanelReq, TrackingResponseSearchawb } from "../interfaces/searchPanel";

@Injectable({
  providedIn: 'root',
})
export class trackingNow{
    private http = inject(HttpClient)

    getHelpData(request: HelpDataRequest): Observable<HelpDataResponse> {
      return this.http.post<HelpDataResponse>(
        '/BANKMISR/reference-options', request);
    }

    trackawb(reqBody:TrackingAWBReq):Observable<TrackInfoRes>{
        return this.http.post<TrackInfoRes>
        ('/BANKMISR/tracking', reqBody)

    }
  
    trackByshipperref(reqBody:searchPanelReq):Observable<TrackingResponseSearchawb>{
    return this.http.post<TrackingResponseSearchawb>
    (`/BANKMISR/reference-search`,reqBody)
    }
    
}
