import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlobalService } from '../services/global.service';

@Directive({
  selector: '[appNavIntersection]'
})
export class NavIntersectionDirective implements OnInit, AfterViewInit, OnDestroy {
  private navObserver?: IntersectionObserver|null;
  private subscriptions = new Subscription();
  private navLinks?: string[];

  constructor(
    private globalService: GlobalService,
    private element: ElementRef
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.globalService.navLinks.subscribe(_list => this.navLinks = _list));
    this.navSetup();
  }

  ngAfterViewInit(): void {
    this.navObserver?.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.clearObserver();
  }

  // =======================
  // || General Functions ||
  // =======================

  clearObserver(): void {
    if (this.navObserver) {
      this.navObserver.disconnect();
      this.navObserver = null;
    };
  };

  navSetup(): void {
    this.navObserver = new IntersectionObserver(entry => {
      if (entry) {
        const location = document.URL.substring(document.URL.lastIndexOf('/') + 1);
        
        if (this.navLinks!.includes(location)) {
          const navId = this.globalService.generateElementId(location);
          this.globalService.makeActiveNav(navId);
        };

        this.clearObserver();
      };
    });
  };
}
