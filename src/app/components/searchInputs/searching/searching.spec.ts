import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';
import { Searching } from './searching';
import { TrackInfoRes } from '../../../core/interfaces/trackResponse';
import { trackingNow } from '../../../core/service/tracking';
import { StorageService } from '../../../admin/service/storgeService';
import { awbStateService } from '../../../core/service/stats/awbstat';
import { Logout } from '../../signout/logout/logout';

 describe('Searching reference selection', () => {
  let component: Searching;
  let fixture: ComponentFixture<Searching>;
  const match = { AWBNo: 'BM001', ShipperRef: '001234567890', Consignee: 'Test recipient', ConsigneePhone: '01000000000', Dated: '01-11-26' };
  const service = { getHelpData: vi.fn(), trackawb: vi.fn(), trackByshipperref: vi.fn() };
  const removeItem = vi.fn();
  const navigate = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    service.getHelpData.mockReturnValue(of({ Code: '1', JasonHelpData: JSON.stringify([match, { ...match, AWBNo: 'BM002' }]) }));
    await TestBed.configureTestingModule({
      imports: [Searching, Logout],
      providers: [
        { provide: trackingNow, useValue: service },
        { provide: Router, useValue: { navigate } },
        { provide: StorageService, useValue: { getItem: () => ({ UserID: 'test', UserPWD: 'test', CoCode: 'dh02043' }), removeItem } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Searching);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.referenceDialog()!.nativeElement.showModal = vi.fn();
    component.referenceDialog()!.nativeElement.close = vi.fn();
  });

  it.each(['pod', 'POD', ' PoD '])('recognizes delivered status %s with the correct label, icon and color', status => {
    expect(component.getStatusLabel(status)).toBe('Delivered');
    expect(component.getStatusIcon(status)).toBe('fa-solid fa-circle-check');
    expect(component.getStatusClass(status)).toBe('status-delivered');
  });

  it('shows the full reference, AWB, consignee and phone without automatically tracking', () => {
    component.searchType.set('shipperReference');
    component.searchValue.set('123456');
    component.search();
    fixture.detectChanges();
    expect(service.getHelpData).toHaveBeenCalledWith(expect.objectContaining({ Database: 'integraontrack', SQL: expect.stringContaining("like N'123456%'"), UserID: 'test', UserPwd: 'test' }));
    expect(service.trackawb).not.toHaveBeenCalled();
    const text = fixture.nativeElement.querySelector('dialog').textContent;
    for (const value of [match.ShipperRef, match.AWBNo, match.Consignee, match.ConsigneePhone]) expect(text).toContain(value);
    const track = vi.spyOn(component, 'trackingNowByAwb').mockImplementation(() => {});
    fixture.nativeElement.querySelector('.reference-match').click();
    expect(track).toHaveBeenCalledWith(match.AWBNo);
    expect(component.searchType()).toBe('shipperReference');
    expect(component.searchValue()).toBe(match.ShipperRef);
    expect(component.shipmentShipperReference()).toBe(match.ShipperRef);
  });

  it('tracks a single match directly without opening the dialog', () => {
    service.getHelpData.mockReturnValue(of({ Code: '1', JasonHelpData: JSON.stringify([match]) }));
    const track = vi.spyOn(component, 'trackingNowByAwb').mockImplementation(() => {});
    component.searchType.set('shipperReference');
    component.searchValue.set('123456');
    component.search();
    expect(track).toHaveBeenCalledExactlyOnceWith(match.AWBNo);
    expect(component.submittedSearch()).toEqual({ type: 'shipperReference', value: match.ShipperRef });
    expect(component.searchType()).toBe('shipperReference');
    expect(component.searchValue()).toBe(match.ShipperRef);
    expect(component.shipmentShipperReference()).toBe(match.ShipperRef);
    expect(component.referenceDialog()!.nativeElement.showModal).not.toHaveBeenCalled();
  });

  it('preserves the existing search at eight characters', () => {
    const existing = vi.spyOn(component, 'shiperRefSearch').mockImplementation(() => {});
    component.searchType.set('shipperReference');
    component.searchValue.set('12345678');
    component.search();
    expect(existing).toHaveBeenCalledWith('12345678');
    expect(service.getHelpData).not.toHaveBeenCalled();
  });

  it.each(['12345678', '123456789', '123456789012'])('offers shipment selection for multiple matches at %s', reference => {
    service.trackByshipperref.mockReturnValue(of({ code: '1', JasonString: JSON.stringify([match, { ...match, AWBNo: 'BM002' }]) }));
    const track = vi.spyOn(component, 'trackingNowByAwb').mockImplementation(() => {});
    component.searchType.set('shipperReference');
    component.searchValue.set(reference);
    component.search();
    expect(component.referenceMatches().map(row => row.AWBNo)).toEqual(['BM001', 'BM002']);
    expect(component.referenceDialog()!.nativeElement.showModal).toHaveBeenCalledOnce();
    expect(track).not.toHaveBeenCalled();
    component.selectReferenceMatch(component.referenceMatches()[1]);
    expect(track).toHaveBeenCalledExactlyOnceWith('BM002');
    expect(component.searchValue()).toBe(match.ShipperRef);
    expect(component.searchType()).toBe('shipperReference');
  });

  it.each([
    ['123456789012', [match]],
    ['1234567890123', [match, { ...match, AWBNo: 'BM002' }]],
  ])('tracks directly for %s when selection is unnecessary', (reference, matches) => {
    service.trackByshipperref.mockReturnValue(of({ code: '1', JasonString: JSON.stringify(matches) }));
    const track = vi.spyOn(component, 'trackingNowByAwb').mockImplementation(() => {});
    component.searchType.set('shipperReference');
    component.searchValue.set(reference);
    component.search();
    expect(track).toHaveBeenCalledExactlyOnceWith(match.AWBNo);
    expect(component.referenceDialog()!.nativeElement.showModal).not.toHaveBeenCalled();
  });

  it('handles empty results and malformed JSON', () => {
    component.searchType.set('shipperReference');
    component.searchValue.set('123456');
    service.getHelpData.mockReturnValue(of({ Code: '1', JasonHelpData: '[]' }));
    component.search();
    expect(component.isEmpty()).toBe(true);
    service.getHelpData.mockReturnValue(of({ Code: '1', JasonHelpData: 'invalid' }));
    component.search();
    expect(component.searchError()).toBe(true);
    expect(component.referenceDialog()!.nativeElement.showModal).not.toHaveBeenCalled();
  });

  it('restores the tracked shipment and reference search after returning, then clears them on sign out', () => {
    const result = {
      code: '1',
      TrackInfo: [{ ShipmentInformation: { AWBNo: match.AWBNo }, trackList: [] }],
    } as unknown as TrackInfoRes;
    service.getHelpData.mockReturnValue(of({ Code: '1', JasonHelpData: JSON.stringify([match]) }));
    service.trackawb.mockReturnValue(of(result));
    component.searchType.set('shipperReference');
    component.searchValue.set('123456');
    component.search();
    fixture.destroy();

    const returned = TestBed.createComponent(Searching);
    returned.detectChanges();
    const restored = returned.componentInstance;
    expect(restored.trackInfoo()).toBe(result);
    expect(restored.searchType()).toBe('shipperReference');
    expect(restored.searchValue()).toBe(match.ShipperRef);
    expect(TestBed.inject(awbStateService).awbNum()).toBe(match.AWBNo);
    expect(service.trackawb).toHaveBeenCalledTimes(1);

    const late = new Subject<TrackInfoRes>();
    service.trackawb.mockReturnValue(late);
    restored.trackingNowByAwb(match.AWBNo);
    TestBed.createComponent(Logout).componentInstance.logout();
    late.next(result);

    const nextSession = TestBed.createComponent(Searching).componentInstance;
    expect(nextSession.trackInfoo()).toBeNull();
    expect(nextSession.searchType()).toBe('shipperReference');
    expect(nextSession.searchValue()).toBe('');
    expect(TestBed.inject(awbStateService).awbNum()).toBeNull();
    expect(removeItem).toHaveBeenCalledWith('userCredentials');
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('renders the receiver address in separate lines and keeps weight and pieces in the summary', () => {
    component.trackInfoo.set({ TrackInfo: [{ ShipmentInformation: {
      AWBNo: 'BM001', Receiver: 'Recipient', ConsigneeDetails: 'Recipient, 16 شارع التحرير - الهرم، CAIRO, 01000000000',
      Origin: 'Origin branch', Destination: 'Destination branch', Weight: 1, Pcs: 2,
    }, trackList: [] }] } as unknown as TrackInfoRes);
    fixture.detectChanges();
    const view = fixture.nativeElement as HTMLElement;
    expect([...view.querySelectorAll('.trk-address-line')].map(line => line.textContent?.trim()))
      .toEqual(['16 شارع التحرير', 'الهرم', 'CAIRO']);
    const summary = view.querySelector('.trk-summary')?.textContent;
    expect(summary).toContain('1 kg');
    expect(summary).toContain('Pieces');
    expect(summary).not.toContain('Origin branch');
    expect(summary).not.toContain('Destination branch');
  });

  it.each([
    [{ ConsigneeMobile: '+20 100 000 0000', ConsigneePhone: '01011111111' }, '+20 100 000 0000', 'tel:+201000000000'],
    [{ ConsigneePhone: '01000000000' }, '01000000000', 'tel:01000000000'],
    [{ ConsigneePhone: '01000000000, 01000000000' }, '01000000000', 'tel:01000000000'],
    [{ ConsigneePhone: '01000000000 01000000000' }, '01000000000', 'tel:01000000000'],
    [{ ConsigneePhone: '0100000000001000000000' }, '01000000000', 'tel:01000000000'],
    [{ ConsigneePhone: '01000000000 / +20 100 000 0000' }, '01000000000', 'tel:01000000000'],
    [{ ConsigneePhone: '01000000000 / 01111111111' }, '01000000000 / 01111111111', null],
    [{ ConsigneeDetails: 'Recipient, Cairo, 01000000000' }, '01000000000', 'tel:01000000000'],
    [{ ConsigneeDetails: 'Recipient, Cairo' }, '', null],
  ])('displays the receiver phone from tracking data %#', (fields, phone, link) => {
    component.trackInfoo.set({ TrackInfo: [{ ShipmentInformation: { AWBNo: 'BM001', Receiver: 'Recipient', ...fields }, trackList: [] }] } as unknown as TrackInfoRes);
    fixture.detectChanges();
    expect(component.receiverPhone()).toBe(phone);
    expect(component.receiverPhoneLink()).toBe(link);
    const elements = [...fixture.nativeElement.querySelectorAll('.trk-receiver-phone a')] as HTMLAnchorElement[];
    expect(elements.map(element => element.textContent?.trim())).toEqual(phone ? phone.split(' / ') : []);
    if (elements.length === 1) expect(elements[0].getAttribute('href')).toBe(link);
    component.trackInfoo.set(null);
    expect(component.receiverPhone()).toBe('');
  });
});

