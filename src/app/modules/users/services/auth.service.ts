import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../helpers/DTO/user';
import { Router } from '@angular/router';
import { UsersService } from './users.service';
import { UrlService } from '../../../shared/services/url.service';
import { isEmptyObj } from '../../core/mesibo/helpers/utilityHelper';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  user: User;
  private userBS: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  public currentUser: Observable<User>;
  private Urlservice = UrlService;

  constructor(
    private router: Router,
    private userService: UsersService
  ) {
    this.userBS = new BehaviorSubject<User>(null);
    this.currentUser = this.userBS.asObservable();
  }

  public get currentUserValue(): User {
    return this.userBS.value;
  }

  setUserBS(user) {
    let userData = user;
    if (isEmptyObj(user) == false) {
      userData.qbid = +userData.qbid;
    }
    this.userBS.next(userData);
  }

  getToken() {
    return localStorage.getItem('_token');
  }

  getUserDetails() {
    return JSON.parse(localStorage.getItem('userDetails'));
  }

  setApplicationToken(token, user) {
    this.clearLocalStorage();
    localStorage.setItem('userDetails', JSON.stringify(user));
    localStorage.setItem('_token', token);
  }

  setQuickBloxId(id) {
    let user = this.currentUserValue;
    user.qbid = id;
    let token = this.getToken();
    this.setApplicationToken(token, user);
  }

  loginStatus() {
    if (this.currentUserValue && this.getToken()) {
      return true;
    } else {
      return false;
    }
  }

  clearLocalStorage() {
    localStorage.removeItem('userDetails');
    localStorage.clear();
  }

  clearSubscribe() {
    this.userBS.next(null);
    this.user = null;
  }

  logout() {
    this.clearLocalStorage();
    this.clearSubscribe();
    this.router.navigate([this.Urlservice.PUBLIC_PAGE.HOME_URL]);
  }

  redirectToHome() {
    this.router.navigate([this.Urlservice.PUBLIC_PAGE.HOME_URL]);
  }

  redirectToLogin() {
    this.router.navigate([this.Urlservice.USER_PAGE.LOGIN_URL]);
  }

  redirectToDashboard() {
    this.router.navigate([this.Urlservice.USER_PAGE.DASHBOARD_URL]);
  }

  getUserAccount() {
    //return this.currentUserValue ? this.currentUserValue : this.userService.getAccount();
  }
}
