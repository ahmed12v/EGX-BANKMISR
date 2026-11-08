import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { closeUpdateRequestQuery, isUpdateDone } from '../../core/interfaces/update-request-category';
import { Dashboard, cairoDate, locationQuery } from './dashboard';
import { complainService } from '../../core/service/complain';
import { StorageService } from '../../admin/service/storgeService';

describe('CRM cached requests', () => {
  const row = (id: string, date: string, ref = 'REF-123') => ({ CoReg: id, ComplaintDate: date,
    Complaint: 'Full address and delivery instructions', AirwayBillNo: '123', Remarks: '', RootCause: 'BANK REQUEST', Status: 'Open', StatusCode: 'QR', ShipperReference: ref });
  let requests: any[];
  let data: any[];
  let noRecords: boolean;
  let failUpdate: boolean;
  beforeEach(() => {
    localStorage.clear(); requests = []; data = []; noRecords = false; failUpdate = false;
    TestBed.configureTestingModule({ providers: [
      { provide: StorageService, useValue: { getItem: () => ({ UserID: 'CRM@EGYPTEXPRESS' }) } },
      { provide: complainService, useValue: { getcomplainStatus: (request: unknown) => {
        requests.push(request);
        if ((request as { SqlString: string }).SqlString.startsWith('SET NOCOUNT')) {
          if (failUpdate) return of({ Code: '-1', Description: 'Failed', JasonString: '' });
          data[0] = { ...data[0], StatusCode: 'CC' };
          return of({ Code: '1', Description: 'SUCCESS', JasonString: JSON.stringify([{ CoReg: data[0].CoReg, AirwayBillNo: data[0].AirwayBillNo, StatusCode: 'CC' }]) });
        }
        return of(noRecords ? { Code: '-1', Description: 'Records not Found', JasonString: '' } :
          { Code: '0', Description: 'SUCCESS', JasonString: JSON.stringify(data) });
      } } },
    ] });
  });
  const create = () => TestBed.runInInjectionContext(() => new Dashboard());
  it('loads all data once and searches reference and instructions live without requests', () => {
    data = [row('1', cairoDate()), row('2', '01/01/2020', 'OLD-REF')];
    const dashboard = create(); dashboard.refresh();
    expect(requests.length).toBe(1);
    expect(requests[0].SqlString).toBe(locationQuery);
    expect(requests[0].DateFrom).toBe('');
    expect(dashboard.totalCount()).toBe(2);
    dashboard.fromDate.set(''); dashboard.toDate.set(''); dashboard.applyDates();
    dashboard.setSearch('old-ref'); expect(dashboard.filtered().map(r => r.CoReg)).toEqual(['2']);
    dashboard.setSearch('delivery instructions'); expect(dashboard.filtered().length).toBe(2);
    dashboard.setSearch('missing'); expect(dashboard.visible()).toEqual([]);
    expect(requests.length).toBe(1);
  });
  it('filters cached dates inclusively without changing total or today counts', () => {
    data = [row('1', cairoDate()), row('2', '01/01/2020')];
    const dashboard = create(); dashboard.refresh();
    dashboard.fromDate.set('2020-01-01'); dashboard.toDate.set('2020-01-01'); dashboard.applyDates();
    expect(dashboard.filtered().map(r => r.CoReg)).toEqual(['2']);
    expect(dashboard.totalCount()).toBe(2); expect(dashboard.todayCount()).toBe(1);
    expect(requests.length).toBe(1);
    dashboard.fromDate.set('2021-01-01'); expect(dashboard.applyDates()).toBe(false);
    expect(dashboard.filtered().length).toBe(1);
  });
  it('clears stale data on Records not Found', () => {
    const dashboard = create(); dashboard.rows.set([row('1', cairoDate())]);
    noRecords = true; dashboard.refresh();
    expect(dashboard.rows()).toEqual([]); expect(dashboard.totalCount()).toBe(0);
    expect(dashboard.error()).toBe('');
  });
  it('saves completion on the server and reads it after a new session', () => {
    data = [row('1', cairoDate())];
    const dashboard = create(); dashboard.refresh(); dashboard.toggleCompleted(data[0], true);
    expect(requests[1].SqlString).toContain("SET Status = 'CC'");
    expect(dashboard.isCompleted(dashboard.rows()[0])).toBe(true);
    expect(localStorage.length).toBe(0);
    const nextSession = create(); nextSession.refresh();
    expect(nextSession.isCompleted(nextSession.rows()[0])).toBe(true);
    const count = requests.length;
    nextSession.toggleCompleted(nextSession.rows()[0], false);
    nextSession.toggleCompleted(nextSession.rows()[0], true);
    expect(requests.length).toBe(count);
  });
  it('does not mark a request done when saving fails', () => {
    data = [row('1', cairoDate())]; failUpdate = true;
    const dashboard = create(); dashboard.refresh(); dashboard.toggleCompleted(data[0], true);
    expect(dashboard.isCompleted(dashboard.rows()[0])).toBe(false);
    expect(dashboard.completionError()).toContain('Could not confirm');
    expect(dashboard.isSaving(data[0])).toBe(false);
  });
  it('restricts writes to exactly one bank request and quotes identity values', () => {
    const sql = closeUpdateRequestQuery("123'4", 'AWB1');
    expect(sql).toContain("CoReg = N'123''4'");
    expect(sql).toContain("AWBNO = N'AWB1'");
    expect(sql).toContain("= 'BANK REQUEST'");
    expect(sql).toContain('UPDLOCK, HOLDLOCK');
    expect(sql).toContain('ROLLBACK TRANSACTION');
    expect(() => closeUpdateRequestQuery('', 'AWB1')).toThrow();
    expect(isUpdateDone(' CC ')).toBe(true);
    expect(isUpdateDone('QR')).toBe(false);
  });
  it('opens the complete request details', () => {
    const dashboard = create(); dashboard.openDetails(row('1', cairoDate()));
    expect(dashboard.selected()?.Complaint).toBe('Full address and delivery instructions');
  });
});
