import { computed, DestroyRef, ElementRef, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { takeUntil } from 'rxjs';
import { LoadingService } from '../../../core/service/spinner';
import { ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trackingNow } from '../../../core/service/tracking';
import { StorageService } from '../../../admin/service/storgeService';
import { ShipmentDetails, ShipperReferenceMatch } from '../../../core/interfaces/searchPanel';
import { awbStateService } from '../../../core/service/stats/awbstat';
import { TrackingSession } from '../../../core/service/stats/tracking-session';
interface TrackingEvent {
  DeliveredTo: string;
  Location: string;
  Remarks: string;
  Status: string;
  TransTime: string;
  Transdate: string;
}

interface ShipmentInformation {
  AWBNo: string;
  AccountNo: string;
  ActWeight: number;
  CustomerCash: string;
  Destination: string;
  GoodsDesc: string;
  Origin: string;
  Pcs: number;
  Receiver: string;
  Sender: string;
  Weight: number;
}

interface Shipment {
  ShipmentInformation: ShipmentInformation;
  trackList: TrackingEvent[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-searching',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './searching.html',
  styleUrls: ['./searching.css', './tracking-results.css'],
})
export class Searching {
  readonly loading = inject(LoadingService);

  //#region Status

  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      // Delivery
      '03': 'Consignee Issue',
      '07': 'Delivery Refused',
      '08': 'Delivery Attempt Failed',
      '10': 'Package Damaged',
      '17': 'Future Delivery',
      '29': 'Re-Route',
      '31': 'Delivery Delay',
      '33': 'Missorted',
      '43': 'Shipment Lost',
      '44': 'Shipment in Cage',
      '77': 'Unable to Locate',
      '99': 'Over Capacity',

      AF: 'Arrived at Facility',
      AH: 'Arrived at Hub',
      DF: 'Departed Facility',
      DS: 'Shipment Destroyed',
      HC: 'Hold for Collection',
      HO: 'On Hold',
      IC: 'Clearance In Progress',
      ID: 'Clearance Delay',
      INF: 'Shipment Information Received',
      IT: 'In Transit',
      LC: 'Location Information Received',
      ODA: 'Out for Delivery',
      OFD: 'With Delivery Courier',
      PDR: 'Returned',
      POD: 'Delivered',
      PUP: 'Pickup Done',
      RT: 'Return to Shipper in Progress',
      SD: 'Delivery Scheduled',
      SR: 'Shipment Release',

      // Booking
      BBC: 'Holiday / Business Closed',
      BCB: 'Call Back Request',
      BCL: 'Area / Location Changed',
      BCO: 'Closed on Arrival',
      BCR: 'Cheque Not Ready',
      BCT: 'Need Contact Number',
      BDB: 'Duplicate Booking',
      BDE: 'Need Department Details',
      BID: 'Incomplete Documentation',
      BNA: 'No Answer / Mobile Switched Off',
      BNN: 'Need Contact Name',
      BNO: 'Need Original Invoice',
      BNR: 'Need Original Receipt',
      BPA: 'Contact Person Not Available',
      BPN: 'Shipment Not Ready',
      BSA: 'Shipment Already Collected',
      BSS: 'No Such Shipment',
      BVP: 'Van Pickup',
      BWA: 'Wrong Address',
      BWN: 'Wrong Number',
      IM: 'Import Collection',
      PE: 'Pickup Exception',
    };

    return statuses[(status ?? '').trim().toUpperCase()] || 'Shipment Update';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      '03': 'fa-solid fa-user-xmark',
      '07': 'fa-solid fa-ban',
      '08': 'fa-solid fa-house-circle-xmark',
      '10': 'fa-solid fa-box-open',
      '17': 'fa-solid fa-calendar-days',
      '29': 'fa-solid fa-route',
      '31': 'fa-solid fa-clock',
      '33': 'fa-solid fa-shuffle',
      '43': 'fa-solid fa-box',
      '44': 'fa-solid fa-boxes-stacked',
      '77': 'fa-solid fa-magnifying-glass',
      '99': 'fa-solid fa-layer-group',

      AF: 'fa-solid fa-building',
      AH: 'fa-solid fa-warehouse',
      DF: 'fa-solid fa-truck',
      DS: 'fa-solid fa-trash',
      HC: 'fa-solid fa-box',
      HO: 'fa-solid fa-pause',
      IC: 'fa-solid fa-file-circle-check',
      ID: 'fa-solid fa-triangle-exclamation',
      INF: 'fa-solid fa-box',
      IT: 'fa-solid fa-truck',
      LC: 'fa-solid fa-location-dot',
      ODA: 'fa-solid fa-motorcycle',
      OFD: 'fa-solid fa-motorcycle',
      PDR: 'fa-solid fa-rotate-left',
      POD: 'fa-solid fa-circle-check',
      PUP: 'fa-solid fa-box',
      RT: 'fa-solid fa-arrow-rotate-left',
      SD: 'fa-solid fa-calendar-check',
      SR: 'fa-solid fa-unlock',

      BBC: 'fa-solid fa-calendar-xmark',
      BCB: 'fa-solid fa-phone',
      BCL: 'fa-solid fa-location-dot',
      BCO: 'fa-solid fa-building-circle-xmark',
      BCR: 'fa-solid fa-money-check',
      BCT: 'fa-solid fa-phone',
      BDB: 'fa-solid fa-copy',
      BDE: 'fa-solid fa-building',
      BID: 'fa-solid fa-file-circle-xmark',
      BNA: 'fa-solid fa-phone-slash',
      BNN: 'fa-solid fa-user',
      BNO: 'fa-solid fa-file-invoice',
      BNR: 'fa-solid fa-receipt',
      BPA: 'fa-solid fa-user-clock',
      BPN: 'fa-solid fa-box',
      BSA: 'fa-solid fa-box',
      BSS: 'fa-solid fa-circle-question',
      BVP: 'fa-solid fa-van-shuttle',
      BWA: 'fa-solid fa-location-dot',
      BWN: 'fa-solid fa-phone-slash',
      IM: 'fa-solid fa-hand-holding-dollar',
      PE: 'fa-solid fa-triangle-exclamation',
    };

    return icons[(status ?? '').trim().toUpperCase()] || 'fa-solid fa-circle-info';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      '03': 'status-warning',
      '07': 'status-warning',
      '08': 'status-warning',
      '10': 'status-warning',
      '17': 'status-info',
      '29': 'status-forwarded',
      '31': 'status-warning',
      '33': 'status-warning',
      '43': 'status-returned',
      '44': 'status-facility',
      '77': 'status-warning',
      '99': 'status-warning',

      AF: 'status-facility',
      AH: 'status-hub',
      DF: 'status-forwarded',
      DS: 'status-returned',
      HC: 'status-hold',
      HO: 'status-hold',
      IC: 'status-info',
      ID: 'status-warning',
      INF: 'status-info',
      IT: 'status-forwarded',
      LC: 'status-info',
      ODA: 'status-delivery',
      OFD: 'status-delivery',
      PDR: 'status-returned',
      POD: 'status-delivered',
      PUP: 'status-delivered',
      RT: 'status-returned',
      SD: 'status-info',
      SR: 'status-info',

      BBC: 'status-warning',
      BCB: 'status-info',
      BCL: 'status-info',
      BCO: 'status-warning',
      BCR: 'status-warning',
      BCT: 'status-info',
      BDB: 'status-warning',
      BDE: 'status-info',
      BID: 'status-warning',
      BNA: 'status-warning',
      BNN: 'status-info',
      BNO: 'status-info',
      BNR: 'status-info',
      BPA: 'status-warning',
      BPN: 'status-info',
      BSA: 'status-forwarded',
      BSS: 'status-warning',
      BVP: 'status-forwarded',
      BWA: 'status-warning',
      BWN: 'status-warning',
      IM: 'status-info',
      PE: 'status-warning',
    };

    return classes[(status ?? '').trim().toUpperCase()] || 'status-default';
  }
  //#endregion
  //#region inhection
  @Output() newSearch = new EventEmitter<void>();
  _trackingService = inject(trackingNow);
  _storgeService = inject(StorageService);
  private readonly session = inject(TrackingSession);
  private readonly destroyRef = inject(DestroyRef);
  readonly trackInfoo = this.session.trackInfo;
  readonly trackingList = this.session.trackingList;
  readonly trackingEvents = computed(() => (this.trackingList() ?? []).map(event => {
    const clean = (value: string) => (value ?? '')
      .replace(/&(?:#x20|#32|nbsp);/gi, ' ').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    const remarks = clean(event.Remarks);
    const deliveredTo = clean(event.DeliveredTo);
    const deliveryInRemarks = remarks.match(/Delivered\s+To\s*:\s*(.*?)(?:\s+ID\s*:\s*(\d+))?$/i);
    const delivery = deliveredTo || deliveryInRemarks?.[0] || '';
    const id = delivery.match(/\bID\s*:\s*(\d+)/i)?.[1] || deliveryInRemarks?.[2] || '';
    const name = delivery.replace(/^Delivered\s+To\s*:\s*/i, '').replace(/\s*\bID\s*:\s*\d+.*/i, '').trim();
    return {
      ...event,
      deliveryName: name,
      deliveryId: id,
      displayRemarks: deliveryInRemarks ? remarks.slice(0, deliveryInRemarks.index).trim() : remarks,
    };
  }));
  _storgeSer = inject(StorageService);
  readonly awbSearch = this.session.awbSearch;
  readonly senderAddress = computed(() => {
    const details = this.trackInfoo()?.TrackInfo[0]?.ShipmentInformation.ShipperDetails ?? '';
    return details.replace(/^\s*bank\s+misr\s*(?:,|$)/i, '')
      .split(',').map(part => part.trim()).filter(Boolean).join(', ');
  });
  readonly receiverAddressLines = computed(() => {
    const shipment = this.trackInfoo()?.TrackInfo[0]?.ShipmentInformation;
    const parts = (shipment?.ConsigneeDetails ?? '').split(/[,،\r\n]+/).map(part => part.trim()).filter(Boolean);
    const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
    if (parts.length && normalize(parts[0]) === normalize(shipment?.Receiver ?? '')) parts.shift();
    const lines = parts.filter(part => !/^\+?[\d\s()-]{7,}$/.test(part))
      .flatMap(part => part.split(/\s+[-–—]\s+/));
    return [...new Set(lines)];
  });
  readonly receiverPhone = computed(() => {
    const shipment = this.trackInfoo()?.TrackInfo[0]?.ShipmentInformation;
    if (!shipment) return '';
    const searchResult = this.awbSearch()?.find(row => row.AWBNo === shipment.AWBNo);
    const reference = this.referenceMatches().find(row => row.AWBNo === shipment.AWBNo);
    const phone = [shipment.ConsigneeMobile, shipment.ConsigneePhone,
      searchResult?.ConsigneeMobile, searchResult?.ConsigneePhone, reference?.ConsigneePhone]
      .map(value => String(value ?? '').trim()).find(Boolean);
    const raw = phone || (shipment.ConsigneeDetails ?? '').split(/[,،\r\n]+/).map(part => part.trim())
      .filter(part => /^\+?[\d\s()/-]{7,}$/.test(part)).join(' / ');
    const numbers = raw.split(/[,;/|\n]+/).map(value => {
      let number = value.trim();
      const spaced = number.split(/\s+/);
      if (spaced.length > 1 && spaced.every(part => part === spaced[0]) && /^\+?\d{7,15}$/.test(spaced[0])) number = spaced[0];
      const digits = number.replace(/[^\d+]/g, '');
      for (let size = 7; size <= 15 && size * 2 <= digits.length; size++) {
        const unit = digits.slice(0, size);
        if (digits.length % size === 0 && unit.repeat(digits.length / size) === digits) return unit;
      }
      return number;
    }).filter(Boolean);
    const seen = new Set<string>();
    return numbers.filter(number => {
      const key = number.replace(/[^\d]/g, '').replace(/^(?:0020|20)(?=1\d{9}$)/, '0');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).join(' / ');
  });
  readonly receiverPhoneLink = computed(() => {
    if (this.receiverPhone().includes(' / ')) return null;
    const phone = this.receiverPhone().replace(/[^\d+]/g, '');
    return /^\+?\d{7,15}$/.test(phone) ? `tel:${phone}` : null;
  });
  readonly receiverPhones = computed(() => this.receiverPhone().split(' / ').filter(Boolean).map(number => {
    const digits = number.replace(/[^\d+]/g, '');
    return { number, href: /^\+?\d{7,15}$/.test(digits) ? `tel:${digits}` : null };
  }));

  readonly isEmpty = this.session.isEmpty;
  readonly isNotFound = this.session.isNotFound;
  _awbState = inject(awbStateService);
  //#endregion
  //#region searching Design
  readonly searchType = this.session.searchType;
  readonly searchValue = this.session.searchValue;
  readonly submittedSearch = this.session.submittedSearch;
  readonly searchError = this.session.searchError;
  readonly referenceMatches = this.session.referenceMatches;
  readonly selectedShipperReference = this.session.selectedShipperReference;
  readonly shipmentShipperReference = computed(() => {
    const reference = this.trackInfoo()?.TrackInfo[0]?.ShipmentInformation.ShipperRef;
    return String(reference ?? '').trim() || this.selectedShipperReference();
  });
  readonly referenceDialog = viewChild<ElementRef<HTMLDialogElement>>('referenceDialog');

  closeReferenceDialog(): void {
    this.referenceDialog()?.nativeElement.close();
    this.searchInput()?.nativeElement.focus();
  }

  selectReferenceMatch(match: ShipperReferenceMatch): void {
    this.closeReferenceDialog();
    this.completeShipperReference(match.ShipperRef);
    this.trackingNowByAwb(match.AWBNo);
  }

  private completeShipperReference(reference: string | null | undefined): void {
    const fullReference = String(reference ?? '').trim();
    this.selectedShipperReference.set(fullReference);
    if (fullReference) {
      this.searchType.set('shipperReference');
      this.searchValue.set(fullReference);
      this.submittedSearch.set({ type: 'shipperReference', value: fullReference });
    }
  }

  private searchShortReference(reference: string): void {
    const credentials = this._storgeService.getItem('userCredentials');
    if (!credentials?.UserID || !credentials?.UserPWD) {
      this.searchError.set(true);
      return;
    }
    // Treat the reference as a literal SQL LIKE substring. if > 12 characters, it will be handled by shiperRefSearch instead.
    const literal = reference.replace(/'/g, "''").replace(/\[/g, '[[]')
      .replace(/%/g, '[%]').replace(/_/g, '[_]');
    this._trackingService.getHelpData({
      Database: 'integraontrack',
      SQL: `select Top 100 AWBNo, convert(varchar, Billdate, 5) as Dated, ShipperRef, Origin, Destination, Shipper, Consignee, ConsigneePhone From AWBActive where 1=1 and isnull(ShipperRef,'')<>'' and AccountNo = 'dh02043' and ShipperRef like N'${literal}%' Order by Billdate Desc`,
      UserID: credentials.UserID,
      UserPwd: credentials.UserPWD,
    }).pipe(takeUntil(this.session.reset$), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        if (response.Code !== '1') {
          this.searchError.set(true);
          return;
        }
        try {
          const data: unknown = JSON.parse(response.JasonHelpData);
          if (!Array.isArray(data) || !data.every(row => row && typeof row.AWBNo === 'string' && row.AWBNo.trim())) {
            this.searchError.set(true);
            return;
          }
          this.referenceMatches.set(data);
          if (!data.length) {
            this.isEmpty.set(true);
            return;
          }
          if (data.length === 1) {
            this.selectReferenceMatch(data[0]);
            return;
          }
          this.referenceDialog()?.nativeElement.showModal();
        } catch {
          this.searchError.set(true);
        }
      },
      error: () => this.searchError.set(true),
    });
  }
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  editSearch() {
    const previous = this.submittedSearch();
    this.searchType.set(previous.type);
    this.searchValue.set(previous.value);
    this.searchInput()?.nativeElement.focus();
    this.searchInput()?.nativeElement.select();
  }

  tryOtherSearchType() {
    this.selectSearchType(this.submittedSearch().type === 'awb' ? 'shipperReference' : 'awb');
    this.isEmpty.set(false);
    this.isNotFound.set(false);
    this.searchError.set(false);
    this.searchInput()?.nativeElement.focus();
  }
  isSearchDropdownOpen = signal(false);

  toggleSearchDropdown(): void {
    this.isSearchDropdownOpen.update((open) => !open);
  }

  selectSearchType(type: 'awb' | 'shipperReference'): void {
    this.searchType.set(type);
    this.isSearchDropdownOpen.set(false);
    // Optional: clear old search value
    this.searchValue.set('');
  }

  search(): void {
    const value = this.searchValue().trim();

    if (!value || this.loading.isLoading()) {
      return;
    }
    this.submittedSearch.set({ type: this.searchType(), value });
    this.closeReferenceDialog();
    this.referenceMatches.set([]);
    this.selectedShipperReference.set('');
    this.searchError.set(false);
    this._awbState.clear();
    // Clear previous search result
    this.trackInfoo.set(null);
    this.trackingList.set(null);
    this.awbSearch.set(null);

    // Clear previous messages
    this.isEmpty.set(false);
    this.isNotFound.set(false);

    this.newSearch.emit();

    if (this.searchType() === 'awb') {
      this.trackingNowByAwb(value);
    } else if (value.length < 8) {
      this.searchShortReference(value);
    } else {
      this.shiperRefSearch(value);
    }
  }
  //#endregion

  //#region trackForm
  trackingForm: FormGroup = new FormGroup({
    AccountNo: new FormControl(''),
    TrackingNo: new FormControl(''),
    ActiveDataBase: new FormControl('integraontrack'),
    AccountPWD: new FormControl(''),
  });
  //#endregion

  //#region trackNow

  refreshShipment(awb: string) {
    const previous = this.submittedSearch();
    const search = previous.type === 'shipperReference' ? previous : { type: 'awb' as const, value: awb };
    this.submittedSearch.set(search);
    this.searchError.set(false);
    this._awbState.clear();
    this.trackInfoo.set(null);
    this.trackingList.set(null);
    this.isEmpty.set(false);
    this.isNotFound.set(false);
    this.searchType.set(search.type);
    this.searchValue.set(search.value);
    this.trackingNowByAwb(awb);
  }

  trackingNowByAwb(awb: string) {
    const userCradtional = this._storgeService.getItem('userCredentials');
    this.trackingForm.patchValue({
      AccountNo: userCradtional.CoCode,
      AccountPWD: userCradtional.UserPWD,
      TrackingNo: awb,
      ActiveDataBase: 'integraontrack',
    });
    if (this.trackingForm.valid) {
      this._trackingService.trackawb(this.trackingForm.value)
        .pipe(takeUntil(this.session.reset$), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          if (res.code === '-1' || !res.TrackInfo?.length) {
            this.trackInfoo.set(null);
            this.trackingList.set(null);
            this.isNotFound.set(true);
            return;
          }
          //has data
          this.trackInfoo.set(res);
          this.trackingList.set([...res.TrackInfo[0].trackList]);
          this.isNotFound.set(false);
          this._awbState.set(res.TrackInfo[0].ShipmentInformation.AWBNo);
          console.log(this._awbState.awbNum());
        },
        error: (err) => {
          this.trackInfoo.set(null);
          this.trackingList.set(null);
          this.searchError.set(true);
        },
      });
    }
  }

  //#endregion

  //#region panel Form
  panelForm: FormGroup = new FormGroup({
    AccessCode: new FormControl(''),
    ActiveDataBase: new FormControl(''),
    FilterCondition: new FormControl(''),
    FilterFinal: new FormControl(''),
    FilterMid: new FormControl(''),
    Status: new FormControl(''),
    DateFrom: new FormControl(''),
    DateTo: new FormControl(''),
    ShipperAccountName: new FormControl(''),
    ConsigneeName: new FormControl(''),
    AWBRangeFrom: new FormControl(''),
    AWBRangeTo: new FormControl(''),
    ShipmentReference: new FormControl(''),
    BookingReferenceNumber: new FormControl(''),
    ShipperPhoneNo: new FormControl(''),
    ConsigneeTelNo: new FormControl(''),
    Origin: new FormControl(''),
    Dest: new FormControl(''),
    GoodsDescription: new FormControl(''),
    SpecialInstruction: new FormControl(''),
    Product: new FormControl(''),
    Service: new FormControl(''),
    WtFrom: new FormControl(''),
    WtTo: new FormControl(''),
    ShipmentStatus: new FormControl(''),
  });
  //#endregion

  //#region searchByShipper
  shiperRefSearch(shipperReference: string): void {
    const userCrad = this._storgeSer.getItem('userCredentials');

    const today = new Date();

    const dateTo = today.toISOString().split('T')[0];

    const dateFromDate = new Date();

    dateFromDate.setFullYear(today.getFullYear() - 1);

    const dateFrom = dateFromDate.toISOString().split('T')[0];

    this.panelForm.patchValue({
      DateFrom: dateFrom,
      DateTo: dateTo,
      ShipmentReference: shipperReference,
    });

    const form = this.panelForm.getRawValue();

    let filterCondition = ` and 1=1 `;

    if (form.DateFrom) {
      filterCondition += ` and m.PickUpDate >= '${form.DateFrom}'`;
    }

    if (form.DateTo) {
      filterCondition += ` and m.PickUpDate <= '${form.DateTo}'`;
    }

    if (form.AWBRangeFrom) {
      filterCondition += ` and m.AWBNo >= '${form.AWBRangeFrom}'`;
    }

    if (form.AWBRangeTo) {
      filterCondition += ` and m.AWBNo <= '${form.AWBRangeTo}'`;
    }

    if (form.ShipmentReference) {
      filterCondition += `
      and isnull(m.ShipperRef,'')
      like '%${form.ShipmentReference}%'
    `;
    }

    if (form.BookingReferenceNumber) {
      filterCondition += `
      and isnull(m.BookingRefNo,'')
      = '${form.BookingReferenceNumber}'
    `;
    }

    if (form.Origin) {
      filterCondition += `
      and isnull(m.Origin,'')
      = '${form.Origin}'
    `;
    }

    if (form.Dest) {
      filterCondition += `
      and m.Destination
      = '${form.Dest}'
    `;
    }

    if (form.Product) {
      filterCondition += `
      and isnull(m.ProductType,'')
      = '${form.Product}'
    `;
    }

    if (form.Service) {
      filterCondition += `
      and isnull(m.ServiceType,'')
      = '${form.Service}'
    `;
    }

    if (form.ShipperAccountName) {
      filterCondition += `
      and (
        isnull(d.Shipper,'')
        like '%${form.ShipperAccountName}%'

        or

        isnull(d.ShipperName,'')
        like '%${form.ShipperAccountName}%'
      )
    `;
    }

    if (form.ConsigneeName) {
      filterCondition += `
      and (
        isnull(d.Consignee,'')
        like '%${form.ConsigneeName}%'

        or

        isnull(d.ConsigneeName,'')
        like '%${form.ConsigneeName}%'
      )
    `;
    }

    if (form.ShipmentStatus) {
      filterCondition += `
      and m.Status='${form.ShipmentStatus}'
    `;
    }

    const request = {
      AccessCode: userCrad.UserID,

      ActiveDataBase: 'integraontrack',

      FilterCondition: filterCondition,

      FilterFinal: ' and 1=1',

      FilterMid: ' and 1=1',

      Status: '',
    };

    this._trackingService.trackByshipperref(request)
      .pipe(takeUntil(this.session.reset$), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.awbSearch.set([]);

        if (res.code === '-1' || !res.JasonString || res.JasonString === '[]') {
          this.isEmpty.set(true);

          return;
        }

        const newData: ShipmentDetails[] = JSON.parse(res.JasonString);

        if (!newData.length) {
          this.isEmpty.set(true);

          return;
        }

        this.awbSearch.set(newData);

        this.isEmpty.set(false);

        if (shipperReference.length <= 12 && newData.length > 1) {
          this.referenceMatches.set(newData.map(shipment => ({
            AWBNo: shipment.AWBNo,
            Dated: shipment.PickupDate,
            ShipperRef: shipment.ShipperRef,
            Consignee: shipment.Consignee,
            ConsigneePhone: shipment.ConsigneePhone,
          })));
          this.referenceDialog()?.nativeElement.showModal();
          return;
        }

        // =========================
        // GET AWB
        // =========================

        const awb = newData[0].AWBNo;

        if (!awb) {
          this.isEmpty.set(true);

          return;
        }

        // =========================
        // TRACK USING AWB
        // =========================

        this.completeShipperReference(newData[0].ShipperRef);
        this.trackingNowByAwb(awb);
      },

      error: (err) => {
        console.error('Shipper Reference Search Error:', err);

        this.awbSearch.set([]);

        this.searchError.set(true);
      },
    });
  }
  //#endregion
}

