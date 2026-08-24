import { Component, signal } from '@angular/core';
import { Searching } from '../../../components/searchInputs/searching/searching';
import { Complain } from '../../../components/complainStatus/complain/complain';
import { RaiseComplain } from '../../../components/raiseComplain/raise-complain/raise-complain';

@Component({
  selector: 'app-home',
  imports: [Searching ,Complain, RaiseComplain],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  selectedAwb = signal<string>('');
  showRaiseComplaint = signal(false);

openRaiseComplaint(awb:string | null) {
   if (!awb) {
    return;
  }
  this.showRaiseComplaint.set(true);
   this.selectedAwb.set(awb);
}

closeRaiseComplaint() {
  this.showRaiseComplaint.set(false);
}
}
