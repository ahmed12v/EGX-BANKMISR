import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trackingNow } from '../../../core/service/tracking';
import { StorageService } from '../../../admin/service/storgeService';
import { TrackInfoRes, TrackList } from '../../../core/interfaces/trackResponse';
import { ShipmentDetails } from '../../../core/interfaces/searchPanel';
import { awbStateService } from '../../../core/service/stats/awbstat';
interface TrackingEvent {
  DeliveredTo: string;
  Location: string;
  Remarks: string;
  Status: string;
  TransTime: string;
  Transdate: string;
}

interface ShipmentInformation {
  AWBNo: string;
  AccountNo: string;
  ActWeight: number;
  CustomerCash: string;
  Destination: string;
  GoodsDesc: string;
  Origin: string;
  Pcs: number;
  Receiver: string;
  Sender: string;
  Weight: number;
}

interface Shipment {
  ShipmentInformation: ShipmentInformation;
  trackList: TrackingEvent[];
}

@Component({
  selector: 'app-searching',
  imports: [CommonModule , ReactiveFormsModule , FormsModule],
  templateUrl: './searching.html',
  styleUrl: './searching.css',
})
export class Searching {

//#region Status

getStatusLabel(status: string): string {

  const statuses: Record<string, string> = {

    SIR: 'Shipment Information Received',
    AF: 'Arrived at Facility',
    DF: 'Departed',
    AH: 'Arrived at Hub',
    OFD: 'Out for Delivery',
    HO: 'On Hold',
    '07': 'Delivery Issue',
    PDR: 'Returned',
    POD: 'Delivered'

  };

  return statuses[status] || 'Shipment Update';
}

getStatusIcon(status: string): string {

  const icons: Record<string, string> = {

    SIR: 'fa-solid fa-box',
    AF: 'fa-solid fa-building',
    DF: 'fa-solid fa-truck',
    AH: 'fa-solid fa-warehouse',
    OFD: 'fa-solid fa-motorcycle',
    HO: 'fa-solid fa-pause',
    '07': 'fa-solid fa-triangle-exclamation',
    PDR: 'fa-solid fa-rotate-left',
    POD: 'fa-solid fa-circle-check'

  };

  return icons[status] || 'fa-solid fa-circle-info';
}

getStatusClass(status: string): string {

  const classes: Record<string, string> = {

    SIR: 'status-info',
    AF: 'status-facility',
    DF: 'status-forwarded',
    AH: 'status-hub',
    OFD: 'status-delivery',
    HO: 'status-hold',
    '07': 'status-warning',
    PDR: 'status-returned',
     POD: 'status-delivered'

  };

  return classes[status] || 'status-default';
}
//#endregion
  //#region inhection
  @Output() newSearch = new EventEmitter<void>();
  _trackingService= inject(trackingNow)
  _storgeService = inject(StorageService)
  trackInfoo = signal<TrackInfoRes | null >(null)
  trackingList=signal<TrackList[] | null>(null)
  _storgeSer=inject(StorageService)
  awbSearch =signal<ShipmentDetails[]|null>(null)
  isEmpty=signal(false)
  isNotFound = signal(false);
  _awbState= inject(awbStateService)
  //#endregion
  //#region searching Design
searchType: 'awb' | 'shipperReference' = 'awb';
searchValue = '';
isSearchDropdownOpen = false;

toggleSearchDropdown(): void {
  this.isSearchDropdownOpen = !this.isSearchDropdownOpen;
}

selectSearchType(
  type: 'awb' | 'shipperReference'
): void {

  this.searchType = type;
  this.isSearchDropdownOpen = false;
  // Optional: clear old search value
  this.searchValue = '';
}

search(): void {
  const value = this.searchValue.trim();

  if (!value) {
    return;
  }
 this._awbState.clear();
  // Clear previous search result
  this.trackInfoo.set(null);
  this.trackingList.set(null);
  this.awbSearch.set(null);

  // Clear previous messages
  this.isEmpty.set(false);
  this.isNotFound.set(false);

  this.newSearch.emit();

  if (this.searchType === 'awb') {
    this.trackingNowByAwb(value);
  } else {
    this.shiperRefSearch(value);
  }
}
//#endregion

//#region trackForm
trackingForm:FormGroup = new FormGroup({
  AccountNo: new FormControl(""),
  TrackingNo: new FormControl(""),
    ActiveDataBase: new FormControl("integraontrack"),
    AccountPWD: new FormControl(""),
})
//#endregion

//#region trackNow
 
trackingNowByAwb(awb: string){
  const userCradtional = this._storgeService.getItem('userCredentials')
  this.trackingForm.patchValue({
     AccountNo: userCradtional.CoCode,
      AccountPWD: userCradtional.UserPWD,
      TrackingNo: awb,
      ActiveDataBase: 'integraontrack',
  })
  if(this.trackingForm.valid){
    this._trackingService.trackawb(this.trackingForm.value).subscribe({
      next:res=>{
         if (res.code === "-1" || !res.TrackInfo?.length) {
            this.trackInfoo.set(null);
            this.trackingList.set(null);
            this.isNotFound.set(true);
            return;
          }
          //has data 
          this.trackInfoo.set(res)
          this.trackingList.set([...res.TrackInfo[0].trackList])
          this.isNotFound.set(false);
          this._awbState.set(res.TrackInfo[0].ShipmentInformation.AWBNo)
          console.log(this._awbState.awbNum());
          
      },
      error:err=>{
        this.trackInfoo.set(null);
        this.trackingList.set(null);
      }
    })
  }
}

//#endregion

//#region panel Form 
   panelForm :FormGroup = new FormGroup({
    AccessCode: new FormControl(''),
    ActiveDataBase: new FormControl(''),
    FilterCondition: new FormControl(''),
    FilterFinal: new FormControl(''),
    FilterMid: new FormControl(''),
    Status: new FormControl(''),
    DateFrom: new FormControl(''),
    DateTo: new FormControl(''),
    ShipperAccountName: new FormControl(''),
    ConsigneeName: new FormControl(''),
    AWBRangeFrom: new FormControl(''),
    AWBRangeTo: new FormControl(''),
    ShipmentReference: new FormControl(''),
    BookingReferenceNumber: new FormControl(''),
    ShipperPhoneNo: new FormControl(''),
    ConsigneeTelNo: new FormControl(''),
    Origin: new FormControl(''),
    Dest: new FormControl(''),
    GoodsDescription: new FormControl(''),
    SpecialInstruction: new FormControl(''),
    Product: new FormControl(''),
    Service: new FormControl(''),
    WtFrom: new FormControl(''),
    WtTo: new FormControl(''),
    ShipmentStatus: new FormControl(''),
   
   })
  //#endregion

  //#region searchByShipper
  shiperRefSearch(shipperReference: string): void {

  const userCrad = this._storgeSer.getItem("userCredentials");

  const today = new Date();

  const dateTo = today.toISOString().split("T")[0];

  const dateFromDate = new Date();

  dateFromDate.setFullYear(today.getFullYear() - 1);

  const dateFrom = dateFromDate.toISOString().split("T")[0];


  this.panelForm.patchValue({
    DateFrom: dateFrom,
    DateTo: dateTo,
    ShipmentReference: shipperReference
  });


  const form = this.panelForm.getRawValue();

  let filterCondition = ` and 1=1 `;


  if (form.DateFrom) {
    filterCondition += ` and m.PickUpDate >= '${form.DateFrom}'`;
  }


  if (form.DateTo) {
    filterCondition += ` and m.PickUpDate <= '${form.DateTo}'`;
  }


  if (form.AWBRangeFrom) {
    filterCondition += ` and m.AWBNo >= '${form.AWBRangeFrom}'`;
  }


  if (form.AWBRangeTo) {
    filterCondition += ` and m.AWBNo <= '${form.AWBRangeTo}'`;
  }


  if (form.ShipmentReference) {
    filterCondition += `
      and isnull(m.ShipperRef,'')
      like '%${form.ShipmentReference}%'
    `;
  }


  if (form.BookingReferenceNumber) {
    filterCondition += `
      and isnull(m.BookingRefNo,'')
      = '${form.BookingReferenceNumber}'
    `;
  }


  if (form.Origin) {
    filterCondition += `
      and isnull(m.Origin,'')
      = '${form.Origin}'
    `;
  }


  if (form.Dest) {
    filterCondition += `
      and m.Destination
      = '${form.Dest}'
    `;
  }


  if (form.Product) {
    filterCondition += `
      and isnull(m.ProductType,'')
      = '${form.Product}'
    `;
  }


  if (form.Service) {
    filterCondition += `
      and isnull(m.ServiceType,'')
      = '${form.Service}'
    `;
  }


  if (form.ShipperAccountName) {

    filterCondition += `
      and (
        isnull(d.Shipper,'')
        like '%${form.ShipperAccountName}%'

        or

        isnull(d.ShipperName,'')
        like '%${form.ShipperAccountName}%'
      )
    `;
  }


  if (form.ConsigneeName) {

    filterCondition += `
      and (
        isnull(d.Consignee,'')
        like '%${form.ConsigneeName}%'

        or

        isnull(d.ConsigneeName,'')
        like '%${form.ConsigneeName}%'
      )
    `;
  }


  if (form.ShipmentStatus) {
    filterCondition += `
      and m.Status='${form.ShipmentStatus}'
    `;
  }


  const request = {

    AccessCode: userCrad.UserID,

    ActiveDataBase: "integraontrack",

    FilterCondition: filterCondition,

    FilterFinal: " and 1=1",

    FilterMid: " and 1=1",

    Status: ""
  };


  this._trackingService.trackByshipperref(request).subscribe({

    next: res => {

      this.awbSearch.set([]);

      if (
        res.code === "-1" ||
        !res.JasonString ||
        res.JasonString === "[]" 
      ) {

        this.isEmpty.set(true);

        return;
      }


      const newData: ShipmentDetails[] =
        JSON.parse(res.JasonString);


      if (!newData.length) {

        this.isEmpty.set(true);

        return;
      }


      this.awbSearch.set(newData);

      this.isEmpty.set(false);


      // =========================
      // GET AWB
      // =========================

      const awb = newData[0].AWBNo;

      if (!awb) {

        console.error(
          'No AWB found for this Shipper Reference'
        );

        return;
      }


      // =========================
      // TRACK USING AWB
      // =========================

      this.trackingNowByAwb(awb);

    },


    error: err => {

      console.error(
        'Shipper Reference Search Error:',
        err
      );

      this.awbSearch.set([]);

      this.isEmpty.set(true);

    }

  });

}
  //#endregion


}
