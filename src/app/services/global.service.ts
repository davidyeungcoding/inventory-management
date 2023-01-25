import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import { Item } from '../interfaces/item';

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

  private navLinksSource = new BehaviorSubject<string[]>(['store-list', 'manage-orders', 'user-list', 'user-account']);
  navLinks = this.navLinksSource.asObservable();
  private statesSource = new BehaviorSubject<string[]>(['AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
    'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI',
    'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH',
    'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VI', 'VT',
    'WA', 'WI', 'WV', 'WY']);
  states = this.statesSource.asObservable();
  private hoursSource = new BehaviorSubject<string[]>(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']);
  hours = this.hoursSource.asObservable();
  private minutesSource = new BehaviorSubject<string[]>(['00', '15', '30', '45']);
  minutes = this.minutesSource.asObservable();
  private timeModifierSource = new BehaviorSubject<string[]>(['AM', 'PM']);
  timeModifier = this.timeModifierSource.asObservable();
  private timeoutSource = new BehaviorSubject<number>(1500);
  timeout = this.timeoutSource.asObservable();
  private ignoreKeysSource = new BehaviorSubject<string[]>(['Alt', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'Backspace',
    'Control', 'Delete', 'End', 'Escape', 'Home', 'Insert', 'Meta', 'NumLock', 'PageDown', 'PageUp', 'Shift', 'Tab']);
  ignoreKeys = this.ignoreKeysSource.asObservable();

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
    $(`${target}`).removeClass('alert-success alert-danger alert-light');
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

  sortList(list: any[], field: string): any[] {
    return list.sort((a, b) => {
      const one: string = String(a[field]).toLowerCase();
      const two: string = String(b[field]).toLowerCase();
      return one < two ? -1
      : one > two ? 1
      : 0;
    });
  };

  reverseSortList(list: any[], field: string): any[] {
    return list.sort((a, b) => {
      const one: string = String(a[field]).toLowerCase();
      const two: string = String(b[field]).toLowerCase();
      return one < two ? 1
      : one > two ? -1
      : 0;
    });
  };

  sortNumberList(list: any[], field: string): any[] {
    return list.sort((a, b) => {
      const one: number = Number(a[field].substring(1));
      const two: number = Number(b[field].substring(1));
      return one < two ? -1
      : one > two ? 1
      : 0;
    });
  };

  reverseSortNumberList(list: any[], field: string): any[] {
    return list.sort((a, b) => {
      const one: number = Number(a[field].substring(1));
      const two: number = Number(b[field].substring(1));
      return one < two ? 1
      : one > two ? -1
      : 0;
    });
  };

  purgeFromList(list: any[], target: any): any[] {
    const temp = [...list];

    for (let i =  0; i < temp.length; i++) {
      if (list[i]._id === target._id) {
        temp.splice(i, 1);
        break;
      };
    };

    return temp;
  };

  replaceInList(list: any[], target: any): any[] {
    const temp = [...list];

    for (let i = 0; i < temp.length; i++) {
      if (temp[i]._id === target._id) {
        temp.splice(i, 1, target);
        break;
      };
    };

    return temp;
  };

  displayPrice(price: string): string {
    return `$${price.substring(0, price.length - 2)}.${price.substring(price.length - 2)}`;
  };

  convertPrice(list: Item[]): void {
    list.forEach(item => { item.price = this.displayPrice(item.price) });
  };
}
