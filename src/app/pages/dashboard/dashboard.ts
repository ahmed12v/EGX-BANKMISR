import { closeUpdateRequestQuery, isUpdateDone, isUpdateRequestCategory, UPDATE_REQUEST_NAME } from '../../core/interfaces/update-request-category';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { finalize } from 'rxjs';
import { complainService } from '../../core/service/complain';
import { StorageService } from '../../admin/service/storgeService';
import { Complaint } from '../../core/interfaces/complain';
interface LocationRequest extends Complaint { ShipperReference?: string; }

import { Logout } from '../../components/signout/logout/logout';

export function cairoDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo', day: '2-digit', month: '2-digit', year: 'numeric',
  }).formatToParts(date);
  const part = (name: string) => parts.find(p => p.type === name)?.value;
  return `${part('day')}/${part('month')}/${part('year')}`;
}

// Use the same category selected by the Update Location form and the bank accounts
// allowed in this portal. Summary counts use the same scope without date filters.
export const locationQuery = `select CoReg,
convert(varchar, Codate, 103) as ComplaintDate,
Complaint, AWBNO as AirwayBillNo, Remarks,
(select top 1 a.ShipperRef from AWBActive a where a.AWBNo = ComplaintRegView.AWBNO
 and a.AccountNo = ComplaintRegView.ClientCode order by a.Billdate desc) as ShipperReference,
rootname as RootCause,
StatusDescription as Status, Status as StatusCode
from ComplaintRegView
where ClientCode in ('DH02043', 'D77777')
and upper(ltrim(rtrim(rootname))) = '${UPDATE_REQUEST_NAME}'
order by Codate desc, CoReg desc`;

export function queryFromDate(from: string, to = ''): string {
  for (const date of [from, to]) {
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date)) {
      throw new Error('Choose valid dates.');
    }
  }
  if (from && to && from > to) throw new Error('From date must be on or before To date.');
  const conditions = [
    from ? `and Codate >= '${from}'` : '',
    to ? `and Codate < DATEADD(day, 1, CONVERT(date, '${to}', 23))` : '',
  ].filter(Boolean).join('\n');
  return conditions ? locationQuery.replace('order by Codate', `${conditions}\norder by Codate`) : locationQuery;
}

@Component({
  selector: 'app-dashboard',
  imports: [Logout],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly service = inject(complainService);
  private readonly storage = inject(StorageService);
  readonly rows = signal<LocationRequest[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly loaded = signal(false);
  readonly today = signal(cairoDate());
  readonly fromDate = signal(this.today().split('/').reverse().join('-'));
  readonly toDate = signal(this.today().split('/').reverse().join('-'));
  readonly appliedFromDate = signal('');
  readonly appliedToDate = signal('');
  readonly totalCount = computed(() => this.loaded() ? this.rows().length : null);
  readonly todayCount = computed(() => this.loaded() ? this.rows().filter(row => row.ComplaintDate === this.today()).length : null);
  readonly statsError = signal('');
  readonly search = signal('');
  readonly selected = signal<LocationRequest | null>(null);
  readonly detailsDialog = viewChild<ElementRef<HTMLDialogElement>>('detailsDialog');
  readonly completionError = signal('');
  readonly savingRequests = signal<Set<string>>(new Set());
  requestKey(row: LocationRequest): string { return JSON.stringify([row.CoReg, row.AirwayBillNo]); }
  isCompleted(row: LocationRequest): boolean { return isUpdateDone(row.StatusCode); }
  isSaving(row: LocationRequest): boolean { return this.savingRequests().has(this.requestKey(row)); }
  toggleCompleted(row: LocationRequest, checked: boolean): void {
    if (!checked || this.isCompleted(row) || this.isSaving(row) || this.loading() || !isUpdateRequestCategory(row.RootCause)) return;
    let sql: string;
    try { sql = closeUpdateRequestQuery(row.CoReg, row.AirwayBillNo); }
    catch { this.completionError.set('Unable to identify this update request.'); return; }
    const key = this.requestKey(row);
    const user = this.storage.getItem('userCredentials');
    this.savingRequests.update(keys => new Set([...keys, key]));
    this.completionError.set('');
    this.service.getcomplainStatus({
      DataBase: 'integraontrack', DateFrom: '', DateTo: '', SqlString: sql,
      UserID: user.UserID, UserPwd: user.UserPWD,
      AWBno: '', InternalStatusCode: '', LifecycleStatus: '', RegSequenceFrom: '', RegSequenceTo: '',
    }).pipe(finalize(() => this.savingRequests.update(keys => {
      const next = new Set(keys); next.delete(key); return next;
    }))).subscribe({
      next: response => {
        try {
          if (response.Code === '-1') throw new Error();
          const result = JSON.parse(response.JasonString);
          if (!Array.isArray(result) || result.length !== 1 ||
              String(result[0].CoReg) !== String(row.CoReg) ||
              String(result[0].AirwayBillNo) !== String(row.AirwayBillNo) || !isUpdateDone(result[0].StatusCode)) throw new Error();
          const updated = { ...row, StatusCode: 'CC', Status: 'Case Closed' };
          this.rows.update(rows => rows.map(item => this.requestKey(item) === key ? updated : item));
          if (this.selected() && this.requestKey(this.selected()!) === key) this.selected.set(updated);
        } catch { this.completionError.set('Could not confirm completion. Refresh to check the saved status.'); }
      },
      error: () => this.completionError.set('Could not confirm completion. Refresh to check the saved status.'),
    });
  }
  openDetails(row: LocationRequest): void {
    this.selected.set(row);
    this.detailsDialog()?.nativeElement.showModal();
  }
  closeDetails(): void { this.detailsDialog()?.nativeElement.close(); }
  readonly dateRows = computed(() => this.rows().filter(row => {
    const parts = row.ComplaintDate?.split('/');
    const date = parts?.length === 3 ? parts.reverse().join('-') : '';
    return (!this.appliedFromDate() || date >= this.appliedFromDate()) &&
      (!this.appliedToDate() || date <= this.appliedToDate());
  }));
  readonly todayOnly = signal(false);
  readonly page = signal(1);
  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.dateRows().filter(row => (!this.todayOnly() || row.ComplaintDate === this.today()) &&
      (!term || [row.CoReg, row.AirwayBillNo, row.Complaint, row.ShipperReference, row.ComplaintDate].some(value => String(value ?? '').toLowerCase().includes(term))));
  });
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / 20)));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * 20, this.page() * 20));

  ngOnInit(): void { this.refresh(); }

  refreshToday(): void {
    if (this.loading() || this.savingRequests().size > 0) return;
    const today = cairoDate();
    const date = today.split('/').reverse().join('-');
    this.today.set(today);
    this.fromDate.set(date);
    this.toDate.set(date);
    this.search.set('');
    this.todayOnly.set(false);
    this.refresh();
  }

  setSearch(value: string): void { this.search.set(value); this.page.set(1); }
  setToday(value: boolean): void { this.todayOnly.set(value); this.page.set(1); }

  applyDates(): boolean {
    try { queryFromDate(this.fromDate(), this.toDate()); }
    catch (error) { this.error.set((error as Error).message); return false; }
    this.appliedFromDate.set(this.fromDate());
    this.appliedToDate.set(this.toDate());
    this.page.set(1);
    this.error.set('');
    return true;
  }

  refresh(): void {
    if (this.loading() || this.savingRequests().size > 0) return;
    const from = this.fromDate();
    const to = this.toDate();
    if (!this.applyDates()) return;
    const user = this.storage.getItem('userCredentials');
    this.loading.set(true);
    this.error.set('');
    this.service.getcomplainStatus({
      DataBase: 'integraontrack', DateFrom: '', DateTo: '', SqlString: locationQuery,
      UserID: user.UserID, UserPwd: user.UserPWD,
      AWBno: '', InternalStatusCode: '', LifecycleStatus: '', RegSequenceFrom: '', RegSequenceTo: '',
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: response => {
        try {
          const noRecords = /^records?\s+not\s+found[.!]?$/i.test(response.Description?.trim() ?? '');
          if (response.Code === '-1' && !noRecords) throw new Error('Request failed');
          const data: unknown = noRecords || !response.JasonString?.trim() ? [] : JSON.parse(response.JasonString);
          if (!Array.isArray(data) || !data.every(row => row && typeof row === 'object' &&
            ['CoReg', 'ComplaintDate', 'Complaint', 'AirwayBillNo', 'RootCause'].every(key => key in row))) {
            throw new Error('Invalid response');
          }
          this.rows.set((data as LocationRequest[]).filter(r => isUpdateRequestCategory(r.RootCause)));
          this.today.set(cairoDate());
          this.appliedFromDate.set(from);
          this.appliedToDate.set(to);
          this.page.set(1);
          this.loaded.set(true);
        } catch { this.error.set('Unable to load location requests. Please try again.'); }
      },
      error: () => this.error.set('Unable to load location requests. Please try again.'),
    });

  }
}
