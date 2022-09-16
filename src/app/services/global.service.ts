import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(
    private router: Router
  ) { }

  // =================
  // || Fixed Value ||
  // =================

  private navLinksSource = new BehaviorSubject<string[]>(['store-list', 'user-account']);
  navLinks = this.navLinksSource.asObservable();
  private statesSource = new BehaviorSubject<string[]>(["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA",
    "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI",
    "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH",
    "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT",
    "WA", "WI", "WV", "WY"]);
  states = this.statesSource.asObservable();
  private timeoutSource = new BehaviorSubject<number>(1500);
  timeout = this.timeoutSource.asObservable();

  // =======================
  // || General Functions ||
  // =======================

  buildValidateHeaders(token: string) {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token
      })
    };
  };

  testName(name: any): boolean {
    const regex = new RegExp('^[\\w\\s]+$', 'gm');
    return regex.test(name);
  };

  displayMsg(add: string, target: string): void {
    $(`${target}`).removeClass('alert-success alert-danger');
    $(`${target}`).addClass(add);
    $(`${target}Container`).css('display', 'inline');
  };

  redirectUser(route: string): void {
    this.router.navigate([`/${route}`]);
  };

  storeActionRedirect(route: string, storeId: string): void {
    this.router.navigate([`/${route}/${storeId}`]);
  };

  togglePassword(field: string): void {
    const fieldType = (<any>$(field)[0]).type;

    if (fieldType === 'password') {
      (<any>$(field)[0]).type = 'text';
      $('.show-password').css('display', 'none');
      $('.hide-password').css('display', 'inline');
    } else {
      (<any>$(field)[0]).type = 'password';
      $('.hide-password').css('display', 'none');
      $('.show-password').css('display', 'inline');
    };
  };

  resetPasswordVisability(field: string): void {
    (<any>$(field)[0]).type = 'password';
    $('.show-password').css('display', 'inline');
    $('.hide-password').css('display', 'none');
  };

  filterList(target: any[], original: any[], index: number): any[] {
    if (!target.length) return original;
    const id = target[index]._id;
    let temp = [...original];

    for (let i = 0; i < temp.length; i++) {
      if (temp[i]._id === id) {
        temp.splice(i, 1);
        if (index + 1 !== target.length) return this.filterList(target, temp, ++index);
        break;
      };
    };

    return temp;
  };

  highlight(id: string, toChange: any): void {
    toChange[id] ? $(`#${id}`).removeClass('selected')
    : $(`#${id}`).addClass('selected');
  };

  clearHighlight(): void {
    $('.selector-option').removeClass('selected');
  };

  removeActiveNav(navId: string): void {
    $(navId).removeClass('active');
    $(navId)[0].ariaCurrent = null;
  };

  makeActiveNav(navId: string): void {
    if (!$(navId)[0]) return;
    $(navId).addClass('active');
    $(navId)[0].ariaCurrent = 'page';
  };

  generateElementId(str: string): string {
    const splitStr = str.split('-');
    const temp = splitStr.map(elem => elem.charAt(0).toUpperCase() + elem.substring(1));
    return `#nav${temp.join('')}`;
  };
}
