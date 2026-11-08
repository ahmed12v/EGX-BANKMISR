import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { QuearyComplain } from './queary-complain';
import { StorageService } from '../../../admin/service/storgeService';
import { complainService } from '../../../core/service/complain';

describe('QuearyComplain', () => {
  let component: QuearyComplain;
  let fixture: ComponentFixture<QuearyComplain>;
  const complaintApi = { getcomplainStatus: vi.fn() };
  const storage = { getItem: vi.fn() };

  beforeEach(async () => {
    complaintApi.getcomplainStatus.mockReset();
    storage.getItem.mockReset();
    await TestBed.configureTestingModule({
      imports: [QuearyComplain],
      providers: [
        { provide: complainService, useValue: complaintApi },
        { provide: StorageService, useValue: storage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuearyComplain);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads complaints, excludes BANK REQUEST in SQL, and maps statuses to Open or Closed', () => {
    const today = component.fromDate();
    const todayFromApi = today.split('-').reverse().join('/');
    storage.getItem.mockReturnValue({ CoCode: 'D77777', UserID: 'test', UserPWD: 'test' });
    complaintApi.getcomplainStatus.mockReturnValue(of({
      Code: '1', Description: 'SUCCESS', JasonString: JSON.stringify([
        { CoReg: '1', ComplaintDate: todayFromApi, Complaint: 'A', AirwayBillNo: '10', Remarks: '', RootCause: 'CRM Request', Status: 'Open' },
        { CoReg: '2', ComplaintDate: '04/11/2020', Complaint: 'B', AirwayBillNo: '20', Remarks: '', RootCause: 'Late Delivery', Status: 'Closed' },
      ]),
    }));

    fixture.detectChanges();

    const request = complaintApi.getcomplainStatus.mock.calls[0][0];
    expect(request.SqlString).toContain("<> 'BANK REQUEST'");
    expect(request.SqlString).toContain("then 'Closed' else 'Open'");
    expect(request.DateFrom).toBe('');
    expect(request.DateTo).toBe('');
    expect(component.complaints().map(row => row.status)).toEqual(['Open', 'Closed']);
    expect(component.toDate()).toBe(today);
    expect(component.filteredComplaints().map(row => row.number)).toEqual(['1']);
    component.updateComplaintNumber('2');
    expect(component.filteredComplaints().map(row => row.number)).toEqual(['1']);
    component.searchByNumber();
    expect(component.filteredComplaints().map(row => row.number)).toEqual(['2']);
    component.updateDate('from', today);
    expect(component.filteredComplaints().map(row => row.number)).toEqual(['2']);
    component.clearFilters();
    expect(component.fromDate()).toBe(today);
    expect(component.filteredComplaints().map(row => row.number)).toEqual(['1']);
    expect(complaintApi.getcomplainStatus).toHaveBeenCalledTimes(1);
  });

  it('paginates filtered results in groups of 10', () => {
    component.complaints.set(Array.from({ length: 21 }, (_, index) => ({
      number: String(index + 1), date: component.fromDate(), awb: String(index + 100),
      subject: `Complaint ${index + 1}`, status: 'Open' as const, rootCause: 'Test',
    })));

    expect(component.paginatedComplaints()).toHaveLength(10);
    expect(component.totalPages()).toBe(3);
    component.goToPage(3);
    expect(component.paginatedComplaints()).toHaveLength(1);
    expect(component.firstVisibleRow()).toBe(21);
    expect(component.lastVisibleRow()).toBe(21);
  });
});
