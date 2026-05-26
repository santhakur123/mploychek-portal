import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.css']
})
export class SkeletonLoaderComponent {
  @Input() type: 'table' | 'profile' | 'card' = 'table';
  @Input() count: number = 3;

  getItems(): number[] {
    return Array(this.count).fill(0);
  }
}
