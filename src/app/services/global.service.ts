import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(
    private router: Router
  ) { }

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

  displayMsg(add: string, target: string, container: string): void {
    $(`${target}`).removeClass('alert-success alert-danger');
    $(`${target}`).addClass(add);
    $(`${container}`).css('display', 'inline');
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
}
