import { Component } from '@angular/core';
import { Searching } from '../../../components/searchInputs/searching/searching';
import { Complain } from '../../../components/complainStatus/complain/complain';

@Component({
  selector: 'app-home',
  imports: [Searching ,Complain],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
