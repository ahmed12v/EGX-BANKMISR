import { ChangeDetectionStrategy } from '@angular/core';
import { afterNextRender, Component, Injector, signal , Renderer2, inject, viewChild } from '@angular/core';
import { Searching } from '../../../components/searchInputs/searching/searching';
import { Complain } from '../../../components/complainStatus/complain/complain';
import { RaiseComplain } from '../../../components/raiseComplain/raise-complain/raise-complain';
import { awbStateService } from '../../../core/service/stats/awbstat';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-content',
  imports: [Searching ,Complain, RaiseComplain],
  templateUrl: './home-content.html',
  styleUrl: './home.css',
  host: { '(window:scroll)': 'updateScrollButton()' },
})
export class HomeContent {
  readonly showScrollTop = signal(false);

  constructor() {
    afterNextRender(() => this.updateScrollButton());
  }

  updateScrollButton() {
    this.showScrollTop.set(window.scrollY > 160);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  readonly searching = viewChild.required(Searching);
  private readonly injector = inject(Injector);
  private readonly scrollToComplaintsAwb = signal<string | null>(null);

  onComplaintCompleted(awb: string) {
    this.closeRaiseComplaint();
    this.scrollToComplaintsAwb.set(awb);
    this.searching().refreshShipment(awb);
  }

  onComplaintsLoaded(awb: string) {
    if (this.scrollToComplaintsAwb() !== awb) return;
    this.scrollToComplaintsAwb.set(null);
    afterNextRender(() => {
      if (this._abwstate.awbNum() !== awb) return;
      document.getElementById('shipment-complaints')?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }, { injector: this.injector });
  }
  selectedAwb = signal<string | null>(null);
  showRaiseComplaint = signal(false);
  readonly supportMode = signal<'complaint' | 'location'>('complaint');
  renderer = inject(Renderer2)
   _abwstate= inject(awbStateService)

openRaiseComplaint(awb:string | null, mode: 'complaint' | 'location' = 'complaint') {
   if (!awb) {
    return;
  }
  this.supportMode.set(mode);
  this.showRaiseComplaint.set(true);
   this.selectedAwb.set(awb);
    setTimeout(() => {

      const element = document.getElementById('raise-complaint');

      if (element) {
        this.renderer
          .setProperty(element, 'scrollTop', element.scrollHeight);

        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

    }, 100);
}

closeRaiseComplaint() {
  this.scrollToComplaintsAwb.set(null);
  this.showRaiseComplaint.set(false);
  this.selectedAwb.set(null);
}
}
