import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(
    private router: Router
  ) { }

  testName(name: any): boolean {
    const regex = new RegExp('^[\\w\\s]+$', 'gm');
    return regex.test(name);
  };

  displayMsg(add: string, target: string, container: string): void {
    $(`${target}`).removeClass('alert-success alert-danger');
    $(`${target}`).addClass(add);
    $(`${container}`).css('display', 'inline');
  };

  redirectUser(route: string): void {
    this.router.navigate([`/${route}`]);
  };
}
