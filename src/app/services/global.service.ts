import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }

  testName(name: any): boolean {
    const regex = new RegExp('^[\\w\\s]+$', 'gm');
    return regex.test(name);
  };

  displayMsg(add: string, target: string, container: string): void {
    $(`${target}`).removeClass('alert-success alert-danger');
    $(`${target}`).addClass(add);
    $(`${container}`).css('display', 'inline');
    console.log(container)
  };
}
