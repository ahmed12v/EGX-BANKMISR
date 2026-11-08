import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StorageService } from '../../../admin/service/storgeService';
import { complainService } from '../../../core/service/complain';

import { UpdatedReq } from './updated-req';

describe('UpdatedReq', () => {
  let component: UpdatedReq;
  let fixture: ComponentFixture<UpdatedReq>;
  const getcomplainStatus = vi.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatedReq],
      providers: [
        { provide: complainService, useValue: { getcomplainStatus } },
        { provide: StorageService, useValue: { getItem: () => ({ CoCode: 'D77777', UserID: 'test', UserPWD: 'test' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatedReq);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows only today’s update requests with the home-page status labels', () => {
    const today = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo' }).format(new Date());
    const row = { ComplaintDate: today, AirwayBillNo: '001', RootCause: 'Bank Request' };
    getcomplainStatus.mockReturnValue(of({
      Code: '1',
      JasonString: JSON.stringify([
        { ...row, CoReg: '1001', Complaint: 'Pending address', StatusCode: 'QR' },
        { ...row, CoReg: '1002', Complaint: 'Updated address', StatusCode: ' CC ' },
        { ...row, CoReg: '1003', Complaint: 'Older request', ComplaintDate: '01/01/2020' },
        { ...row, CoReg: '1004', Complaint: 'Regular complaint', RootCause: 'Late Delivery' },
      ]),
    }));

    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain('Update Requests');
    expect(page.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(page.querySelector('tbody')?.textContent).toContain('Under Review');
    expect(page.querySelector('tbody')?.textContent).toContain('Update Done');
    const numberInput = page.querySelector('input[type="search"]') as HTMLInputElement;
    numberInput.value = '1003';
    numberInput.dispatchEvent(new Event('input', { bubbles: true }));
    const search = [...page.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Search');
    search?.click();
    fixture.detectChanges();
    expect(page.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(page.querySelector('tbody')?.textContent).toContain('Older request');
    expect(getcomplainStatus).toHaveBeenCalledTimes(1);
    expect(getcomplainStatus).toHaveBeenCalledWith(expect.objectContaining({
      DateFrom: '', DateTo: '', SqlString: expect.stringContaining("in ('BANK REQUEST', 'BMR')"),
    }));
  });
});
