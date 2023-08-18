import { Directive, HostListener, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: '[scrollTopTracker]'
})
export class ScrollTopTrackerDirective {
  @Output() scrollingFinished = new EventEmitter<void>();
  emitted = false;
  @HostListener('scroll', ['$event'])
  onScroll(event) {
    if (event.srcElement.scrollTop == 0 && !this.emitted) {
      this.emitted = true;
      this.scrollingFinished.emit();
    } else {
      this.emitted = false;
    }
  }
}