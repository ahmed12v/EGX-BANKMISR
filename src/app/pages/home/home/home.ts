import { Component, signal , Renderer2, inject  } from '@angular/core';
import { Searching } from '../../../components/searchInputs/searching/searching';
import { Complain } from '../../../components/complainStatus/complain/complain';
import { RaiseComplain } from '../../../components/raiseComplain/raise-complain/raise-complain';
import { awbStateService } from '../../../core/service/stats/awbstat';
import { Logout } from '../../../components/signout/logout/logout';

@Component({
  selector: 'app-home',
  imports: [Searching ,Complain, RaiseComplain , Logout],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  selectedAwb = signal<string | null>(null);
  showRaiseComplaint = signal(false);
  renderer = inject(Renderer2)
   _abwstate= inject(awbStateService)

openRaiseComplaint(awb:string | null) {
   if (!awb) {
    return;
  }
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
  this.showRaiseComplaint.set(false);
  this.selectedAwb.set(null);
}
}
