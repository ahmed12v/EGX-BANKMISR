import { isUpdateDone, isUpdateRequestCategory } from '../../../core/interfaces/update-request-category';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, computed, effect, inject, output, signal } from '@angular/core';
import { awbStateService } from '../../../core/service/stats/awbstat';
import { Complaint } from '../../../core/interfaces/complain';
import { complainService } from '../../../core/service/complain';
import { StorageService } from '../../../admin/service/storgeService';
import { FormControl, FormGroup } from '@angular/forms';
import { pipe } from 'rxjs';
import { SlicePipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-complain',
  imports: [SlicePipe],
  templateUrl: './complain.html',
  styleUrl: './complain.css',
})
export class Complain {
   addComplaint = output<string | null>();
   updateLocation = output<string | null>();
   readonly complaintsLoaded = output<string>();

  openRaiseComplaint(awb:string | null) {
     this.addComplaint.emit(awb);
  }
    constructor(private _awbsate:awbStateService){
   //  console.log('QUERY CONSTRUCTOR:', this._awbsate.awbNum());
    effect(()=>{
      const awb = this._awbsate.awbNum()
       //  console.log('EFFECT AWB:', awb);
      if(!awb)return
      this.CompliantSearchForm.patchValue({
        AWBno:awb
      })
    //   console.log(
    //   'FORM AWB:',
    //   this.CompliantSearchForm.get('AWBno')?.value
    // );
      this.SearchNow()
    })

  }
  complaints = signal<Complaint[] | null>(null)
  isUpdateRequest(item: Complaint | null): boolean {
    return isUpdateRequestCategory(item?.RootCause);
  }
  updateRequestStatus(item: Complaint): string { return isUpdateDone(item.StatusCode) ? 'Update Done' : 'Under Review'; }
  readonly complaintRows = computed(() => (this.complaints() ?? []).filter(item => !this.isUpdateRequest(item)));
  readonly updateRows = computed(() => (this.complaints() ?? []).filter(item => this.isUpdateRequest(item)));

  private _compliantService = inject(complainService);
  private _storgeSer = inject(StorageService);
  staeservice = inject(awbStateService)
  //private cdr = inject(ChangeDetectorRef);

  isEmpty = signal(false);
  popupOpen = signal(false);
  today = new Date().toISOString().split("T")[0];

  CompliantSearchForm: FormGroup = new FormGroup({
    DataBase: new FormControl("integraontrack"),
    DateFrom: new FormControl(this.today),
    DateTo: new FormControl(this.today),
    SqlString: new FormControl(""),
    UserID: new FormControl(""),
    UserPwd: new FormControl(""),
    AWBno: new FormControl(""),
    InternalStatusCode: new FormControl(""),
    LifecycleStatus: new FormControl(""),
    RegSequenceFrom: new FormControl(""),
    RegSequenceTo: new FormControl(""),
  });
 //#region  call api

  SearchNow() {
    console.log('query sratrt');
   // this.complaints = [];
    const userCrad = this._storgeSer.getItem("userCredentials");
   // console.log(userCrad);
      const today = new Date();

  const dateTo = today.toISOString().split("T")[0];


  const dateFromDate = new Date();
  dateFromDate.setFullYear(today.getFullYear() - 1);

  const dateFrom = dateFromDate.toISOString().split("T")[0];


  this.CompliantSearchForm.patchValue({
    DateFrom: dateFrom,
    DateTo: dateTo
  });

    const form = this.CompliantSearchForm.getRawValue();

    let sql = `
select
    CoReg,
    convert(varchar, Codate, 103) as ComplaintDate,
    Complaint,
    AWBNO as AirwayBillNo,
    Remarks,
    rootname as RootCause,
    StatusDescription as Status,
    Status as StatusCode
from ComplaintRegView
where 1=1
`;

    if (form.DateFrom) {
      sql += ` and Codate >= '${form.DateFrom}'`;
    }

    if (form.DateTo) {
      sql += ` and Codate <= '${form.DateTo}'`;
    }

    if (form.RegSequenceFrom) {
      sql += ` and CoReg >= '${form.RegSequenceFrom}'`;
    }

    if (form.RegSequenceTo) {
      sql += ` and CoReg <= '${form.RegSequenceTo}'`;
    }

    sql += ` and ClientCode='${userCrad.CoCode}'`;

    if (form.AWBno) {
      sql += ` and (AWBNo like '%${form.AWBno}%' or EnqRefNo like '%${form.AWBno}%')`;
    }

    if (form.InternalStatusCode) {
      sql += ` and Status='${form.InternalStatusCode}'`;
    }

    if (form.LifecycleStatus === "Open") {
      sql += ` and Status <> 'CC'`;
    } else if (form.LifecycleStatus === "Close") {
      sql += ` and Status = 'CC'`;
    }
    this.CompliantSearchForm.patchValue({
      UserID: userCrad.UserID,
      UserPwd: userCrad.UserPWD,
      DataBase: "integraontrack",
      SqlString: sql,
    });

    //console.log(sql);
    this._compliantService
      .getcomplainStatus(this.CompliantSearchForm.getRawValue())
      .subscribe({
        next: (res) => {
           this.complaints.set([]) ;
           this.isEmpty.set(false);
           console.log(res);
           

  if (
    res.Code === "-1" ||
    !res.JasonString ||
    res.JasonString === "[]" ||
    JSON.parse(res.JasonString).length === 0
  ) {

    this.complaints.set([]);
    this.isEmpty.set(true);
    this.popupOpen.set(true);
    this.complaintsLoaded.emit(form.AWBno);
    //this.cdr.detectChanges();

    return;
  }


  const newData: Complaint[] = JSON.parse(res.JasonString);


  this.complaints.set(newData);
  this.complaintsLoaded.emit(form.AWBno);

  this.isEmpty.set(false);

  //this.cdr.detectChanges();
           //this._awbsate.clear()
        },
        error: (err) => {
          console.log(err);
           //this._awbsate.clear()
        },
       
      });
  }
//#endregion

//#region formClear
  resetForm() {
    this.CompliantSearchForm.reset({
      DataBase: "integraontrack",
      DateFrom: this.today,
      DateTo: this.today,
      SqlString: "",
      UserID: "",
      AWBno: "",
      InternalStatusCode: "",
      LifecycleStatus: "",
      RegSequenceFrom: "",
      RegSequenceTo: "",
      AccountNo: "",
      AccountPWD: "",
    });

    this.complaints.set([]);
    this.isEmpty.set(false);
  }
  //#endregion

  //#region detials Popup
  // selectedComplaint!: Complaint;

  // showComplaintPopup = signal(false);

  // openComplaint(item: Complaint) {
  //   this.selectedComplaint = item;
  //   this.showComplaintPopup.set(true);
  // }

  // closeComplaintPopup() {
  //   this.showComplaintPopup.set(false);
  // }
  //#endregion

//#region goToRaise
// @Output() createComplaint = new EventEmitter<string>();

// opennComplaint() {
  
//    const awb = this._awbsate.awbNum();
//   this.createComplaint.emit(awb || '');
  
// }

selectedComplaint = signal<any | null>(null);

openComplaintDetails(complaint: any) {
  this.selectedComplaint.set(complaint);
}

closeComplaintDetails() {
  this.selectedComplaint.set(null);
}

}
