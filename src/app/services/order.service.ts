import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';

import { GlobalService } from './global.service';

import { Order } from '../interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // private api = 'http://localhost:3000/orders'; // dev
  private api = 'orders'; // production

  constructor(
    private globalService: GlobalService,
    private http: HttpClient
  ) { }

  // =====================
  // || Router Requests ||
  // =====================

  createOrder(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.post(`${this.api}/create`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  searchByDate(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.get(`${this.api}/search-date/${payload.storeId}/${payload.date}`, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  searchByDateAndStore(token: string, payload: any) {
    const validateHeader = this.globalService.buildValidateHeaders(token);

    return this.http.put(`${this.api}/search-date-store`, payload, validateHeader).pipe(
      catchError(err => of(err))
    );
  };

  // ======================
  // || Helper Functions ||
  // ======================

  parseMonth(month: string): number {
    return month === 'Jan' ? 1
    : month === 'Feb' ? 2
    : month === 'Mar' ? 3
    : month === 'Apr' ? 4
    : month === 'May' ? 5
    : month === 'Jun' ? 6
    : month === 'Jul' ? 7
    : month === 'Aug' ? 8
    : month === 'Sep' ? 9
    : month === 'Oct' ? 10
    : month === 'Nov' ? 11
    : 12;
  };

  compareMonth(left: string, right: string, direction: boolean): any {
    const leftMonth = this.parseMonth(left);
    const rightMonth = this.parseMonth(right);
    return leftMonth === rightMonth ? 'same'
    : leftMonth > rightMonth && direction || leftMonth < rightMonth && !direction ? true
    : false;
  };

  compareValue(left: number, right: number, direction: boolean): any {
    return left === right ? 'same'
    : left > right && direction || left < right && !direction ? true
    : false;
  };

  compareTime(left: any[], right: any[], direction: boolean): boolean {
    if (left[1] !== right[1] && (left[1] === 'AM' && direction || left[1] === 'PM' && !direction)) return true;
    const leftTime = left[0].split(':');
    const lHour = Number(leftTime[0]) === 12 && left[1] === 'AM' ? 0
    : Number(leftTime[0]) < 12 && left[1] === 'PM' ? Number(leftTime[0]) + 12
    : Number(leftTime[0]);
    const lMinute = leftTime[1];
    const rightTime = right[0].split(':');
    const rHour = Number(rightTime[0]) === 12 && right[1] === 'AM' ? 0
    : Number(rightTime[0]) < 12 && right[1] === 'PM' ? Number(rightTime[0]) + 12
    : Number(rightTime[0]);
    const rMinute = rightTime[1];
    
    if (lHour !== rHour) {
      return lHour > rHour && direction || lHour < rHour && !direction ? true : false;
    } else if (lMinute !== rMinute) {
      return lMinute > rMinute && direction || lMinute < rMinute && !direction ? true : false;
    } else {
      return true;
    };
  };

  compareDate(left: string[], right: string[], direction: boolean): boolean {
    const year = this.compareValue(parseInt(left[3]), parseInt(right[3]), direction);
    if (year !== 'same') return year;
    const month = this.compareMonth(left[1], right[1], direction);
    if (month !== 'same') return month;
    const day = this.compareValue(parseInt(left[2]), parseInt(right[2]), direction);
    if (day !== 'same') return day;
    const time = this.compareTime([left[4], left[5]], [right[4], right[5]], direction);
    return time;
  };

  // =======================
  // || General Functions ||
  // =======================

  parseDateForDisplay(date: any): string {
    const temp = date.toString().split(' ');
    const hour = Number(temp[4].substring(0, 2));
    const modifier = hour < 12 ? 'AM' : 'PM';
    temp[4] = hour === 0 ? `12${temp[4].substring(2)}`
    : hour > 12 ? `${hour - 12}${temp[4].substring(2)}`
    : temp[4];
    const splitTime = temp[4].split(':');
    return `${temp[0]}. ${temp[1]} ${temp[2]}, ${temp[3]} ${splitTime[0]}:${splitTime[1]} ${modifier}`;
  };

  mergeSort(list: any[], field: any, direction: boolean): any[] {
    const mid = Math.floor(list.length / 2);
    let left = list.slice(0, mid);
    let right = list.slice(mid);
    if (left.length > 1) left = this.mergeSort(left, field, direction);
    if (right.length > 1) right = this.mergeSort(right, field, direction);
    let l = 0;
    let r = 0;
    let temp = [];

    while (l + r < list.length) {
      const leftTarget = field === 'store' && left[l] ? left[l].store[0].name
      : left[l] ? left[l][field]
      : null;
      const rightTarget = field === 'store' && right[r] ? right[r].store[0].name
      : right[r] ? right[r][field]
      : null;
      const canCompare = (leftTarget || typeof(leftTarget) === 'number')
        && (rightTarget || typeof(rightTarget) === 'number') ? true : false;

      if (!leftTarget && typeof(leftTarget) !== 'number'
        || canCompare && direction && leftTarget > rightTarget
        || canCompare && !direction && leftTarget < rightTarget) {
        temp.push(right[r]);
        r++;
      } else {
        temp.push(left[l]);
        l++;
      };
    };

    return temp;
  };

  sortDate(list: any[], direction: boolean): any[] {
    const mid = Math.floor(list.length / 2);
    let left = list.slice(0, mid);
    let right = list.slice(mid);
    if (left.length > 1) left = this.sortDate(left, direction);
    if (right.length > 1) right = this.sortDate(right, direction);
    let l = 0;
    let r = 0;
    let temp = [];

    while (l + r < list.length) {
      const leftTarget = left[l] ? left[l].date.split(' ') : null;
      const rightTarget = right[r] ? right[r].date.split(' ') : null;
      const canCompare = leftTarget && rightTarget ? true : false;
      const rightPush = !leftTarget ? true
      : !canCompare ? false
      : this.compareDate(leftTarget, rightTarget, direction);

      if (rightPush) {
        temp.push(right[r]);
        r++;
      } else {
        temp.push(left[l]);
        l++;
      };
    };

    return temp;
  };
}
