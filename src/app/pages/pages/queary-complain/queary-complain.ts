import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../admin/service/storgeService';
import { Complaint } from '../../../core/interfaces/complain';
import { isUpdateDone, isUpdateRequestCategory, UPDATE_REQUEST_NAME, UPDATE_REQUEST_CODE } from '../../../core/interfaces/update-request-category';
import { complainService } from '../../../core/service/complain';
import { ComplaintRow, createComplaintsWorkbook } from './complaints-workbook';

function cairoToday() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()).split('/').reverse().join('-');
}

@Component({
  selector: 'app-queary-complain',
  imports: [FormsModule],
  templateUrl: './queary-complain.html',
  styleUrl: './queary-complain.css',
})
export class QuearyComplain implements OnInit {
  readonly updateRequests = input(false);
  readonly itemLabel = computed(() => this.updateRequests() ? 'Update Request' : 'Complaint');
  readonly itemsLabel = computed(() => this.updateRequests() ? 'update requests' : 'complaints');
  readonly dateLabel = computed(() => this.updateRequests() ? 'Date Logged' : 'Submitted');
  readonly subjectLabel = computed(() => this.updateRequests() ? 'Update Request' : 'Subject');
  readonly categoryLabel = computed(() => this.updateRequests() ? 'Category' : 'Root Cause');
  private readonly complaintService = inject(complainService);
  private readonly storageService = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);
  readonly complaints = signal<ComplaintRow[]>([]);
  readonly fromDate = signal(cairoToday());
  readonly toDate = signal(this.fromDate());
  readonly complaintNumber = signal('');
  readonly appliedComplaintNumber = signal('');
  readonly filteredComplaints = computed(() => {
    const number = this.appliedComplaintNumber();
    if (number) {
      return this.complaints().filter(row => row.number.includes(number));
    }
    const from = this.fromDate();
    const to = this.toDate();
    return this.complaints().filter(row =>
      (!from || row.date >= from) &&
      (!to || (row.date && row.date <= to)),
    );
  });
  readonly pageSize = 10;
  readonly currentPage = signal(1);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredComplaints().length / this.pageSize)));
  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));
  readonly paginatedComplaints = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredComplaints().slice(start, start + this.pageSize);
  });
  readonly firstVisibleRow = computed(() => this.filteredComplaints().length ? (this.currentPage() - 1) * this.pageSize + 1 : 0);
  readonly lastVisibleRow = computed(() => Math.min(this.currentPage() * this.pageSize, this.filteredComplaints().length));
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly exporting = signal(false);
  readonly exportError = signal('');

  readonly selectedComplaint = signal<ComplaintRow | null>(null);

  ngOnInit() {
    this.loadComplaints();
  }

  private loadComplaints() {
    const updateRequests = this.updateRequests();
    const items = this.itemsLabel();
    const credentials = this.storageService.getItem('userCredentials');
    if (!credentials?.CoCode || !credentials?.UserID || !credentials?.UserPWD) {
      this.complaints.set([]);
      this.errorMessage.set(`Unable to load ${items}. Please sign in again.`);
      return;
    }

    const clientCode = this.sqlLiteral(credentials.CoCode);
    const sql = `select CoReg, convert(varchar, Codate, 103) as ComplaintDate,
Complaint, AWBNO as AirwayBillNo, Remarks, rootname as RootCause,
case when Status = 'CC' or LTRIM(RTRIM(StatusDescription)) = 'Case Closed'
then 'Closed' else 'Open' end as Status, Status as StatusCode
from ComplaintRegView
where ClientCode = '${clientCode}'
and UPPER(LTRIM(RTRIM(ISNULL(rootname, '')))) ${updateRequests
  ? `in ('${UPDATE_REQUEST_NAME}', '${UPDATE_REQUEST_CODE}')`
  : `<> '${UPDATE_REQUEST_NAME}'`}
order by Codate desc, CoReg desc`;

    this.loading.set(true);
    this.errorMessage.set('');
    this.complaintService.getcomplainStatus({
      DataBase: 'integraontrack', DateFrom: '', DateTo: '',
      SqlString: sql, UserID: credentials.UserID, UserPwd: credentials.UserPWD,
      AWBno: '', InternalStatusCode: '', LifecycleStatus: '',
      RegSequenceFrom: '', RegSequenceTo: '',
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        try {
          const data: Complaint[] = response.Code === '1' && response.JasonString
            ? JSON.parse(response.JasonString) : [];
          this.complaints.set(data.filter(item => isUpdateRequestCategory(item.RootCause) === updateRequests).map(item => ({
            number: String(item.CoReg ?? '').trim(),
            date: this.toIsoDate(item.ComplaintDate),
            awb: String(item.AirwayBillNo ?? '').trim(),
            subject: String(item.Complaint ?? '').trim(),
            status: this.rowStatus(item, updateRequests),
            rootCause: updateRequests ? 'Update Request' : String(item.RootCause ?? '').trim(),
          })));
          this.currentPage.set(1);
        } catch {
          this.complaints.set([]);
          this.errorMessage.set(`The ${items} response could not be read.`);
        } finally {
          this.loading.set(false);
        }
      },
      error: () => {
        this.complaints.set([]);
        this.loading.set(false);
        this.errorMessage.set(`Unable to load ${items}. Please try again.`);
      },
    });
  }

  updateComplaintNumber(value: string) {
    this.complaintNumber.set(value.replace(/\D/g, ''));
  }

  searchByNumber() {
    this.appliedComplaintNumber.set(this.complaintNumber());
    this.currentPage.set(1);
  }

  updateDate(bound: 'from' | 'to', value: string) {
    (bound === 'from' ? this.fromDate : this.toDate).set(value);
    this.currentPage.set(1);
  }

  clearFilters() {
    const today = cairoToday();
    this.fromDate.set(today);
    this.toDate.set(today);
    this.complaintNumber.set('');
    this.appliedComplaintNumber.set('');
    this.currentPage.set(1);
  }

  private rowStatus(item: Complaint, updateRequests: boolean): ComplaintRow['status'] {
    if (updateRequests) return isUpdateDone(item.StatusCode) ? 'Update Done' : 'Under Review';
    return ['closed', 'case closed'].includes(item.Status?.trim().toLowerCase()) ? 'Closed' : 'Open';
  }

  statusClass(status: ComplaintRow['status']) {
    return status === 'Open' || status === 'Under Review' ? 'status-open' : 'status-closed';
  }

  goToPage(page: number) {
    this.currentPage.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  async exportExcel() {
    const results = this.filteredComplaints();
    if (!results.length || this.loading() || this.exporting()) return;

    this.exporting.set(true);
    this.exportError.set('');
    try {
      const file = await createComplaintsWorkbook(results, this.updateRequests());
      const url = URL.createObjectURL(file);
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = this.updateRequests() ? 'update-requests.xlsx' : 'query-complaints.xlsx';
        link.click();
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      this.exportError.set(`Unable to export the ${this.itemsLabel()}. Please try again.`);
    } finally {
      this.exporting.set(false);
    }
  }

  openComplaint(complaint: ComplaintRow) {
    this.selectedComplaint.set(complaint);
  }

  closeComplaint() {
    this.selectedComplaint.set(null);
  }

  private sqlLiteral(value: unknown) {
    return String(value ?? '').replace(/'/g, "''");
  }

  private toIsoDate(value: string) {
    const match = String(value ?? '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : String(value ?? '').trim();
  }

}
