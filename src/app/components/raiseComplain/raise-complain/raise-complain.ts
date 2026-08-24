import { Component, effect, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-raise-complain',
  imports: [],
  templateUrl: './raise-complain.html',
  styleUrl: './raise-complain.css',
})
export class RaiseComplain {
  awb = input<string>('');
}
