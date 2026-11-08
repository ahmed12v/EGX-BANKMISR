import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { ShipmentDetails, ShipperReferenceMatch } from '../../interfaces/searchPanel';
import { TrackInfoRes, TrackList } from '../../interfaces/trackResponse';

type SearchType = 'awb' | 'shipperReference';
const initialSearch = { type: 'shipperReference' as const, value: '' };

@Injectable({ providedIn: 'root' })
export class TrackingSession {
  private readonly reset = new Subject<void>();
  readonly reset$ = this.reset.asObservable();
  readonly searchType = signal<SearchType>(initialSearch.type);
  readonly searchValue = signal(initialSearch.value);
  readonly submittedSearch = signal<{ type: SearchType; value: string }>(initialSearch);
  readonly trackInfo = signal<TrackInfoRes | null>(null);
  readonly trackingList = signal<TrackList[] | null>(null);
  readonly awbSearch = signal<ShipmentDetails[] | null>(null);
  readonly referenceMatches = signal<ShipperReferenceMatch[]>([]);
  readonly selectedShipperReference = signal('');
  readonly isEmpty = signal(false);
  readonly isNotFound = signal(false);
  readonly searchError = signal(false);

  clear(): void {
    this.reset.next();
    this.searchType.set(initialSearch.type);
    this.searchValue.set(initialSearch.value);
    this.submittedSearch.set(initialSearch);
    this.trackInfo.set(null);
    this.trackingList.set(null);
    this.awbSearch.set(null);
    this.referenceMatches.set([]);
    this.selectedShipperReference.set('');
    this.isEmpty.set(false);
    this.isNotFound.set(false);
    this.searchError.set(false);
  }
}
