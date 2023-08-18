import { Injectable } from '@angular/core';
import { Router } from '@angular/router'
import { ToastrService} from 'ngx-toastr';
import { AuthService } from '../../../app/modules/users/services/auth.service';

const MINUTES_UNITL_AUTO_LOGOUT = 35  // in mins
const CHECK_INTERVAL = 15000 // in ms
const STORE_KEY = 'lastAction';
@Injectable()
export class AutoLogoutService {

  public getLastAction() {
    return parseInt(localStorage.getItem(STORE_KEY));
  }
  public setLastAction(lastAction: number) {
    localStorage.setItem(STORE_KEY, lastAction.toString());
  }

  constructor(private router: Router,private toastr: ToastrService,private authService : AuthService) {
    //console.log('AutoLogoutService object created');
    this.check();
    this.initListener();
    this.initInterval();
  }

  initListener() {
    document.body.addEventListener('click', () => this.reset("click event"));
    document.body.addEventListener('mouseover', () => this.reset("mouseover event"));
    document.body.addEventListener('mouseout', () => this.reset("mouseout event"));
    document.body.addEventListener('keydown', () => this.reset("keydown event"));
    document.body.addEventListener('keyup', () => this.reset("keyup event"));
    document.body.addEventListener('keypress', () => this.reset("keypress event"));
   // document.body.addEventListener('focus', () => this.reset("focus event"));
   // document.body.addEventListener('message', () => this.reset("message event"));
  }

  reset(event) {
    //console.log(event);
    this.setLastAction(Date.now());
  }

  initInterval() {
    setInterval(() => {
      this.check();
    }, CHECK_INTERVAL);
  }

  check() {
    const now = Date.now();
    const timeleft = this.getLastAction() + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;
    const isTimeout = diff < 0;

    if (isTimeout) {
        this.authService.logout();
       }
  }
}
