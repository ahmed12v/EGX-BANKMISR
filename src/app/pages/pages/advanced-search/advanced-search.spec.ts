import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StorageService } from '../../../admin/service/storgeService';
import { trackingNow } from '../../../core/service/tracking';

import { AdvancedSearch } from './advanced-search';

describe('AdvancedSearch', () => {
  let component: AdvancedSearch;
  let fixture: ComponentFixture<AdvancedSearch>;
  const trackByshipperref = vi.fn();

  beforeEach(async () => {
    trackByshipperref.mockReset();
    await TestBed.configureTestingModule({
      imports: [AdvancedSearch],
      providers: [
        { provide: trackingNow, useValue: { trackByshipperref } },
        { provide: StorageService, useValue: { getItem: () => ({ UserID: 'test', CoCode: 'D77777' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancedSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const from = form.elements.namedItem('dateFrom') as HTMLInputElement;
    const to = form.elements.namedItem('dateTo') as HTMLInputElement;
    expect(from.value).toBe(component.today);
    expect(to.value).toBe(component.today);
    from.value = '2026-01-01';
    form.reset();
    expect(from.value).toBe(component.today);
    expect(trackByshipperref).not.toHaveBeenCalled();
  });

  it('submits account-scoped filters and pages the filtered response without a second call', () => {
    trackByshipperref.mockReturnValue(of({ code: '1', JasonString: JSON.stringify(
      Array.from({ length: 11 }, (_, index) => ({ AWBNo: String(index + 100), Status: index === 0 ? ' pod ' : '17' })),
    ) }));
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const set = (name: string, value: string) => {
      (form.elements.namedItem(name) as HTMLInputElement).value = value;
    };
    set('dateFrom', '2026-02-01');
    set('dateTo', '2026-11-08');
    set('awbFrom', '100');
    set('shipperRefTo', "O'Neil");
    set('shipmentStatus', 'pending');
    expect(trackByshipperref).not.toHaveBeenCalled();
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(trackByshipperref).toHaveBeenCalledWith(expect.objectContaining({
      ActiveDataBase: null, Status: '1',
      FilterCondition: expect.stringContaining("m.ShipperRef <= N'O''Neil'"),
    }));
    expect(trackByshipperref.mock.calls[0][0].FilterCondition).toContain("isnull(m.AccountNo,'') = N'D77777'");
    expect(component.visibleRows()).toHaveLength(10);
    fixture.detectChanges();
    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    expect(table.querySelector('.bg-success-subtle')?.textContent).toContain('POD');
    expect(table.querySelector('.bg-warning-subtle')?.textContent).toContain('17');
    component.changePage(2);
    expect(component.visibleRows()).toHaveLength(1);
    expect(trackByshipperref).toHaveBeenCalledTimes(1);
  });
});
