import { LocalStorageService } from './../../util/local-storage.service';
import { ConnectServer } from './../../api/connect-server';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AdalService } from 'adal-angular4';
import { HttpClient } from 'selenium-webdriver/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login-user.component.html',
  styleUrls: ['./login-user.component.css']
})
export class LoginUserComponent implements OnInit, AfterViewInit {

  constructor(
    private resApi: ConnectServer,
    private localStorageService: LocalStorageService,
    private router: Router,
    private adalService: AdalService
  ) {

    //   this.adalService.init(environment.adalConfiguration);
    this.adalService.handleWindowCallback();
    console.log('this.adalService.userInfo.authenticated',
      this.adalService.userInfo.authenticated, this.adalService.userInfo.profile.oid);
    console.log('userinfo', this.adalService.userInfo);
    if (this.adalService.userInfo.authenticated) {
      const oid = this.adalService.userInfo.profile.oid;
      console.log('oid', oid);
      this.resApi.getToken(oid).subscribe(res => {
        console.log('response', res);
        if (res) {
          this.localStorageService.save('token', res.token);
          this.router.navigate(['/']);
        }
      });
    }
  }

  ngOnInit() {

  }

  login() {
    // this.adalService.login();
    this.router.navigate(['/']);
  }

  ngAfterViewInit() {
  }
}
