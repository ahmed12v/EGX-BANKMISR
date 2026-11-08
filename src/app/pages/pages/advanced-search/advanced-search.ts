import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { StorageService } from '../../../admin/service/storgeService';
import { ShipmentDetails } from '../../../core/interfaces/searchPanel';
import { trackingNow } from '../../../core/service/tracking';
import { createResultsWorkbook, workbookDate } from '../queary-complain/complaints-workbook';

const PAGE_SIZE = 10;
const SHIPMENT_STATUS = { all: '0', pending: '1', delivered: '2' } as const;
const sqlText = (value: string) => `N'${value.replace(/'/g, "''")}'`;

@Component({
  selector: 'app-advanced-search',
  imports: [],
  templateUrl: './advanced-search.html',
  styleUrl: '../queary-complain/queary-complain.css',
})
export class AdvancedSearch {
  private readonly tracking = inject(trackingNow);
  private readonly storage = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);
  readonly today = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()).split('/').reverse().join('-');
  readonly columns = [
    { key: 'PickupDate', header: 'Pickup Date', width: 18 },
    { key: 'AWBNo', header: 'AWB No.', width: 24 },
    { key: 'ShipperRef', header: 'Shipper Ref', width: 24 },
    { key: 'Shipper', header: 'Shipper Account', width: 30, wrap: true },
    { key: 'Consignee', header: 'Consignee Client', width: 34, wrap: true },
    { key: 'Origin', header: 'Origin', width: 12 },
    { key: 'Destination', header: 'Destination', width: 15 },
    { key: 'Weight', header: 'Weight (kg)', width: 14 },
    { key: 'Status', header: 'Last Status', width: 16 },
  ] as const;
  readonly rows = signal<ShipmentDetails[]>([]);
  readonly loading = signal(false);
  readonly searched = signal(false);
  readonly error = signal('');
  readonly exporting = signal(false);
  readonly exportError = signal('');
  readonly page = signal(1);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.rows().length / PAGE_SIZE)));
  readonly start = computed(() => (this.page() - 1) * PAGE_SIZE);
  readonly end = computed(() => Math.min(this.start() + PAGE_SIZE, this.rows().length));
  readonly visibleRows = computed(() => this.rows().slice(this.start(), this.end()));

  search(event: Event, form: HTMLFormElement) {
    event.preventDefault();
    if (this.loading() || !form.reportValidity()) return;
    const filters = new FormData(form);
    const field = (name: string) => String(filters.get(name) ?? '').trim();
    const from = field('dateFrom');
    const to = field('dateTo');
    const status = field('shipmentStatus');
    this.resetResults();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) {
      this.error.set('Enter a valid date range. Date from must be on or before Date to.');
      return;
    }
    if (status !== 'all' && status !== 'pending' && status !== 'delivered') return;

    const credentials = this.storage.getItem('userCredentials');
    if (!credentials?.CoCode || !credentials?.UserID) {
      this.error.set('Unable to search shipments. Please sign in again.');
      return;
    }

    const conditions = [
      '1=1',
      `m.PickUpDate >= ${sqlText(from)}`,
      `m.PickUpDate < DATEADD(day, 1, ${sqlText(to)})`,
      `isnull(m.AccountNo,'') = ${sqlText(String(credentials.CoCode))}`,
    ];
    const ranges = [
      ['awbFrom', 'm.AWBNo', '>='],
      ['awbTo', 'm.AWBNo', '<='],
      ['shipperRefFrom', 'm.ShipperRef', '>='],
      ['shipperRefTo', 'm.ShipperRef', '<='],
    ];
    for (const [name, column, operator] of ranges) {
      const value = field(name);
      if (value) conditions.push(`${column} ${operator} ${sqlText(value)}`);
    }

    this.loading.set(true);
    this.searched.set(true);
    this.tracking.trackByshipperref({
      AccessCode: credentials.UserID,
      ActiveDataBase: null,
      FilterCondition: ` and ${conditions.join(' and ')}`,
      FilterFinal: ' and 1=1',
      FilterMid: ' and 1=1',
      Status: SHIPMENT_STATUS[status],
    }).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: response => {
        try {
          if (response.code === '-1' && !response.JasonString) return;
          if (response.code !== '1' && response.JasonString !== '[]') {
            this.error.set('The shipment service could not complete the search.');
            return;
          }
          const rows: unknown = JSON.parse(response.JasonString || '[]');
          if (!Array.isArray(rows)) throw new Error('Expected shipment rows');
          this.rows.set(rows);
        } catch {
          this.error.set('The shipment response could not be read.');
        }
      },
      error: () => this.error.set('Unable to load shipments. Please try again.'),
    });
  }

  resetResults() {
    if (this.loading()) return;
    this.rows.set([]);
    this.page.set(1);
    this.searched.set(false);
    this.error.set('');
    this.exportError.set('');
  }

  changePage(page: number) {
    this.page.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  async exportExcel() {
    const rows = this.rows();
    if (!rows.length || this.loading() || this.exporting()) return;
    this.exporting.set(true);
    this.exportError.set('');
    try {
      const file = await createResultsWorkbook('Shipments', this.columns, rows.map(row =>
        this.columns.map(({ key }) => {
          const value = row[key];
          if (key === 'PickupDate' && value) {
            const parsed = new Date(`${value} UTC`);
            return Number.isNaN(parsed.getTime()) ? workbookDate(String(value)) : parsed;
          }
          if (key === 'Weight' && typeof value === 'number') return value;
          return String(value ?? '');
        }),
      ));
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'shipment-search.xlsx';
      try {
        link.click();
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      this.exportError.set('Unable to export shipments. Please try again.');
    } finally {
      this.exporting.set(false);
    }
  }
}
