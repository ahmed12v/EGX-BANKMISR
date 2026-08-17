import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/service/spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinne-lloading',
  imports: [CommonModule],
  templateUrl: './spinne-lloading.html',
  styleUrl: './spinne-lloading.css',
})
export class SpinneLloading {
    loadingService = inject(LoadingService);

}
