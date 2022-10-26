import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appEditOrderIntersection]'
})
export class EditOrderIntersectionDirective implements OnInit, AfterViewInit, OnDestroy {
  private editOrderObserver?: IntersectionObserver|null;

  constructor(
    private element: ElementRef
  ) { }

  ngOnInit(): void {
    this.checkVisible();
  }

  ngAfterViewInit(): void {
    this.editOrderObserver?.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.clearObserver();
  }

  // =======================
  // || General Functions ||
  // =======================

  clearObserver(): void {
    if (this.editOrderObserver) {
      this.editOrderObserver.disconnect();
      this.editOrderObserver = null;
    };
  };

  checkVisible(): void {
    this.editOrderObserver = new IntersectionObserver(entry => {
      entry[0].intersectionRatio === 0 ? $('#toLeft').css({ translate: '0 0' })
      : $('#toLeft').css({ translate: '-100% 0' });
    });
  };
}
