import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { RaiseComplain } from './raise-complain';
import { StorageService } from '../../../admin/service/storgeService';
import { addComplainService } from '../../../core/service/raiseComplain';

describe('Shipment support modes', () => {
  let fixture: ComponentFixture<RaiseComplain>;
  const service = {
    GetMasterlistComplain: vi.fn(() => of({ Response: [{ cl_CodeID: 'BMR', cl_CodeName: ' BANK REQUEST ' }] })),
    GetregisterNumber: vi.fn(() => of({ BookingNo: 'R1' })),
    GetCustomerDetials: vi.fn(() => of({ CustomerDetails: {} })),
    addComplainNow: vi.fn(() => of({ Description: 'SUCCESS', BookingNo: 'R1' })),
  };
  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({ imports: [RaiseComplain], providers: [
      { provide: StorageService, useValue: { getItem: () => ({ UserID: 'test', UserPWD: 'test', CoCode: 'D77777' }) } },
      { provide: addComplainService, useValue: service },
    ] }).compileComponents();
    fixture = TestBed.createComponent(RaiseComplain);
    fixture.componentRef.setInput('awb', 'AWB1');
  });
  it('locks BANK REQUEST and includes it in the submitted location request', () => {
    fixture.componentRef.setInput('mode', 'location');
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const category = component.complaintForm.controls.ComplaintData.controls.cl_Root;
    expect(category.disabled).toBe(true);
    expect(category.value).toBe('BMR');
    expect(fixture.nativeElement.querySelector('.location-workspace')).toBeTruthy();
    component.resetAll();
    expect(category.value).toBe('BMR');
    component.CreateComplain();
    expect(service.addComplainNow).toHaveBeenCalledWith(expect.objectContaining({ ComplaintData: expect.objectContaining({ cl_Root: 'BMR' }) }));
  });
  it('unlocks category when switching back to complaints', () => {
    fixture.componentRef.setInput('mode', 'location'); fixture.detectChanges();
    fixture.componentRef.setInput('mode', 'complaint'); fixture.detectChanges();
    const category = fixture.componentInstance.complaintForm.controls.ComplaintData.controls.cl_Root;
    expect(category.enabled).toBe(true);
    expect(category.value).toBe('Select a classification…');
    expect(fixture.nativeElement.querySelector('.location-workspace')).toBeNull();
  });
  it('blocks location submission if BANK REQUEST is unavailable', () => {
    fixture.componentRef.setInput('mode', 'location'); fixture.detectChanges();
    fixture.componentInstance.selectors.set([]); fixture.detectChanges();
    fixture.componentInstance.CreateComplain();
    expect(service.addComplainNow).not.toHaveBeenCalled();
    expect(fixture.componentInstance.submitError()).toContain('unavailable');
  });
});
