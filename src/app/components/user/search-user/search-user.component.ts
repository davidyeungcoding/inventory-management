import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { GlobalService } from 'src/app/services/global.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.css']
})
export class SearchUserComponent implements OnInit {
  searchUser = new FormGroup({
    term: new FormControl('')
  });

  constructor(
    private globalService: GlobalService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
  }

  // =======================
  // || General Functions ||
  // =======================

  onSearchUser(): void {
    $('#searchUserBtn').prop('disabled', true);
    $('#userListMsgContainer').css('display', 'none');
    const token = localStorage.getItem('token');
    if (!token) return this.userService.handleMissingToken('#userListMsg');
    const term = this.searchUser.value.term;

    this.userService.searchUser(token, term!).subscribe(_list => {
      if (_list.status === 200) {
        if (_list.token) localStorage.setItem('token', token);
        this.userService.changeFullUserList(_list.msg);

        if (!_list.msg.length) {
          this.userService.changeSystemMsg(`No users found matching username: ${term}`);
          this.globalService.displayMsg('alert-danger', '#userListMsg');
        };
      } else {
        this.userService.changeSystemMsg(_list.msg);
        this.globalService.displayMsg('alert-danger', '#userListMsg');
      };
      
      (<HTMLInputElement>$('#searchUserField')[0]).value = '';
      this.searchUser.setValue({ term: '' });
      $('#searchUserBtn').prop('disabled', false);
    });
  };
}
