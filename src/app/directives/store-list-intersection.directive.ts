import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appStoreListIntersection]'
})
export class StoreListIntersectionDirective implements OnInit, AfterViewInit, OnDestroy {
  private storeListObserver?: IntersectionObserver|null;

  constructor(
    private element: ElementRef
  ) { }

  ngOnInit(): void {
    this.checkVisible();
  }

  ngAfterViewInit(): void {
    this.storeListObserver?.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.clearObserver();
  }

  // =======================
  // || General Functions ||
  // =======================

  clearObserver(): void {
    if (this.storeListObserver) {
      this.storeListObserver.disconnect();
      this.storeListObserver = null;
    };
  };

  checkVisible(): void {
    this.storeListObserver = new IntersectionObserver(entry => {
      (entry[0].intersectionRatio === 0) ? $('#toTopBtn').css({ translate: "0 -100%" })
      : $('#toTopBtn').css({ translate: '0 100%' });
    });
  };
}
