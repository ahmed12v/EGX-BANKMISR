import { ChangeDetectionStrategy } from '@angular/core';
import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../../admin/service/storgeService';
import { addComplainService } from '../../../core/service/raiseComplain';
import { ComplaintRequest, CustomerDetails, masterList, masterListResponse } from '../../../core/interfaces/raiseComplain';
import { errorContext } from 'rxjs/internal/util/errorContext';
import { UPDATE_REQUEST_CODE } from '../../../core/interfaces/update-request-category';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-raise-complain',
  imports: [ReactiveFormsModule],
  templateUrl: './raise-complain.html',
  styleUrl: './raise-complain.css',
})
export class RaiseComplain implements OnInit{
  ngOnInit(): void {
    this.getMasterNow()
    this.getNumber()
    this.getMyDetials()
  }
  awb = input<string>('');
  readonly mode = input<'complaint' | 'location'>('complaint');
  private requestCategory() {
    return this.selectors()?.find(item => item.cl_CodeID?.trim().toUpperCase() === UPDATE_REQUEST_CODE);
  }
  constructor() {
    effect(() => {
      const isLocation = this.mode() === 'location';
      const category = this.requestCategory();
      const control = this.complaintForm.controls.ComplaintData.controls.cl_Root;
      if (isLocation) {
        control.setValue(category?.cl_CodeID ?? '');
        control.disable();
      } else {
        control.enable();
        control.setValue('Select a classification…');
      }
      this.submitError.set('');
    });
  }
  readonly complaintCompleted = output<string>();
  readonly isSubmitting = signal(false);
  readonly submitError = signal('');

  finishComplaint() {
    if (!this.openpopupafterCreation()) return;
    this.openpopupafterCreation.set(false);
    this.complaintCompleted.emit(this.awb());
  }

  //#region declartion
  fb=inject(FormBuilder)
  _storgeData=inject(StorageService)
  _raiseService=inject(addComplainService)
 selectors = signal<masterListResponse[] | null>(null);
 complainRgister=signal<string|null>('')
 NewcomplainRgister=signal<string|null>('')
 today = new Date().toISOString().split('T')[0];
 accountDetails = signal<CustomerDetails | null>(null);
 complainResponse=signal<string | null>(null)
 complaincreatingNumber= signal<string | null >(null)
 openpopupafterCreation=signal<boolean>(false)
  //#endregion

  //#region getMasterList
  masterFOrm:FormGroup = new FormGroup({
  MasterType:new FormControl("CMPL"),
  UserId:new FormControl(""),
  UserPwd:new FormControl(""),
})

getMasterNow(){

  const userCardentioanl = this._storgeData.getItem('userCredentials')
this.masterFOrm.patchValue({
  MasterType:"CMPL",
  UserId:userCardentioanl.UserID,
  UserPwd:userCardentioanl.UserPwd,
})
if(this.masterFOrm.valid){
  this._raiseService.GetMasterlistComplain(this.masterFOrm.value).subscribe({
    next:res=>{
      //console.log(res);
      this.selectors.set(res.Response)
    },
    error:err=>{
     // console.log(err);
    }
  })
}

}
  //#endregion

  //#region getRegistNumber
registForm:FormGroup=new FormGroup({
  AccountNo:new FormControl(''),
  CustomerCode:new FormControl(''),
  UserID:new FormControl(''),
  UserPwd:new FormControl(''),
})

getNumber(){
const userCradentiona = this._storgeData.getItem('userCredentials');
this.registForm.patchValue({
  AccountNo:userCradentiona.CoCode,
  CustomerCode:userCradentiona.CoCode,
  UserPwd:userCradentiona.UserPWD,
  UserID:userCradentiona.UserID
})

if(this.registForm.valid){
  this._raiseService.GetregisterNumber(this.registForm.value).subscribe({
    next:res=>{
      //console.log(res);
      if(res.BookingNo){
        this.complainRgister.set(res.BookingNo)
      
      }
    },
    error:err=>{
      //console.log(err);
    }
  })
}

}
//// neww
getNewNumber(){
const userCradentiona = this._storgeData.getItem('userCredentials');
this.registForm.patchValue({
  AccountNo:userCradentiona.CoCode,
  CustomerCode:userCradentiona.CoCode,
  UserPwd:userCradentiona.UserPWD,
  UserID:userCradentiona.UserID
})

if(this.registForm.valid){
  this._raiseService.GetNewregisterNumber(this.registForm.value).subscribe({
    next:res=>{
      //console.log(res);
      if(res.BookingNo){
        this.NewcomplainRgister.set(res.BookingNo)
      
      }
    },
    error:err=>{
      //console.log(err);
    }
  })
}

}
//#endregion

//#region getAcountDetails
acountDetialsForm:FormGroup=new FormGroup({
  AccountNo:new FormControl(''),
  UserID:new FormControl(''),
  UserPwd:new FormControl(''),
})

getMyDetials(){
  const userCradentional = this._storgeData.getItem('userCredentials')
  this.acountDetialsForm.patchValue({
      AccountNo:userCradentional.CoCode,
      UserID:userCradentional.UserID,
      UserPwd:userCradentional.UserPWD,
  })
  this._raiseService.GetCustomerDetials(this.acountDetialsForm.value).subscribe({
    next:res=>{
       // console.log(res);
         this.accountDetails.set(res.CustomerDetails);
         console.log(this.accountDetails());
         
        
    },
    error:err=>{
       // console.log(err);
    }
  })
}
//#endregion

//#region resetCustData
resetAll(){
 // Reset form
  this.complaintForm.reset();
  const categoryControl = this.complaintForm.controls.ComplaintData.controls.cl_Root;
  categoryControl.setValue(this.mode() === 'location' ? this.requestCategory()?.cl_CodeID ?? '' : 'Select a classification…');

  // Load fresh data
  this.getNumber();
  this.getMyDetials();

}
//#endregion

//#region  addComplain 
complaintForm = this.fb.group({
  UserID: [''],
  UserPwd: [''],

  ComplaintData: this.fb.group({
    cl_COREG: [this.complainRgister()],
    cl_CoDate: [this.today],
    cl_empcode1: [''],
    cl_empcode: [''],
    cl_AWBNO: [this.awb()],
    cl_Act: [''],
    cl_AssignTo: [''],
    cl_Car: [''],
    cl_CarNo: [''],
    cl_ClientCode: [this.accountDetails()?.cl_AccCode],
    cl_CustName: [this.accountDetails()?.cl_CustName],
    cl_EnqRefNo: [''],
    cl_Lev: [''],
    cl_Remarks: [''],
    cl_Root: ['Select a classification…'],
    cl_Status: [''],
    cl_cPerson: [this.accountDetails()?.cl_CPerson],
    cl_complaint: [''],
    cl_email: [this.accountDetails()?.cl_CustEMail],
    cl_sri: [''],
    cl_tel: [this.accountDetails()?.cl_CustPhone || this.accountDetails()?.cl_CustMobile || '']
  })
});

CreateComplain(){
  if (this.isSubmitting() || this.openpopupafterCreation() || !this.awb()) return;
  this.submitError.set('');
  if (this.mode() === 'location') {
    const category = this.requestCategory();
    if (!category) {
      this.submitError.set('The BANK REQUEST category is currently unavailable. Please try again later.');
      return;
    }
    this.complaintForm.controls.ComplaintData.controls.cl_Root.setValue(category.cl_CodeID);
  }
  const userCradentional = this._storgeData.getItem('userCredentials');
  const account = this.accountDetails();

  this.complaintForm.patchValue({
    UserID: userCradentional.UserID,
    UserPwd: userCradentional.UserPWD,
    ComplaintData: {
      // Registration No.
      cl_COREG: this.complainRgister(),
      // Date Lodged
      cl_CoDate: this.today,
      // AWB
      cl_AWBNO: this.awb(),
      // Account / Customer details
      cl_ClientCode: account?.cl_AccCode ?? '',
      cl_CustName: account?.cl_CustName ?? '',
      cl_cPerson: account?.cl_CPerson ?? '',
      cl_email: account?.cl_CustEMail ?? '',
      cl_tel: account?.cl_CustPhone || account?.cl_CustMobile || '' ,
      // User entered
      cl_complaint: this.complaintForm.get(
        'ComplaintData.cl_complaint'
      )?.value ?? '',
      cl_Root: this.complaintForm.get(
        'ComplaintData.cl_Root'
      )?.value ?? '',
      //fields
      // cl_empcode1: '',
      // cl_empcode: '',
      // cl_Act: '',
      // cl_AssignTo: '',
      // cl_Car: '',
      // cl_CarNo: '',
      // cl_EnqRefNo: '',
      // cl_Lev: '',
      // cl_Remarks: '',
      // cl_Status: '',
      // cl_sri: ''
    }
  });

  if(this.complaintForm.valid){
    this.isSubmitting.set(true);
    const request = this.complaintForm.value as ComplaintRequest;
    request.ComplaintData.cl_Root = this.complaintForm.controls.ComplaintData.controls.cl_Root.value ?? '';
    this._raiseService.addComplainNow(request)
    .pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next:res=>{
        this.complaincreatingNumber.set(res.BookingNo)
        this.complainResponse.set(res.Description)
        if(this.complainResponse() ==="SUCCESS"){
          this.openpopupafterCreation.set(true)
        } else {
          this.submitError.set(res.Description || 'Unable to register the complaint. Please try again.');
        }


      },
      error : err=>{
               this.submitError.set('Unable to register the complaint. Please try again.');
               
      }
    })
  }

}
//#endregion

}
