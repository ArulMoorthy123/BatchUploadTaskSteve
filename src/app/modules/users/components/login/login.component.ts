import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MessengerService } from './../../../core/services/messenger.service';
import { UsersService } from '../../services/users.service';
import { UrlService } from '../../../../shared/services/url.service';
import { AuthService } from '../../services/auth.service';
import { UtilityService } from '../../../../shared/services/utility.service';
import { cleanForm } from '../../../../shared/helper/utilityHelper';
import { ChatService } from '../../../core/mesibo/providers/chat.service';
import { MesiboApiService } from '../../../core/mesibo/providers/mesiboApi.service';
import { QBService } from '../../../core/components/messenger/qb/services/qb.service';
declare var QB: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  showPassword: boolean = false;
  loginForm: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  urlServices = UrlService;

  constructor(
    private userService: UsersService,
    private router: Router,
    private auth: AuthService,
    private utilityService: UtilityService,
    private chatService: ChatService,
    private mesiboApi: MesiboApiService,
    private qbService: QBService,
  ) { }

  ngOnInit(): void {
    if (this.auth.loginStatus()) {
      this.auth.redirectToDashboard();
    }
    this.initVariable();
    this.initLoginForm();
  }

  initVariable() {
    this.submitted = false;
    this.loading = false;
  }

  initLoginForm() {
    this.loginForm = new FormGroup({
      userName: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  loginApiPayload() {
    let apiPayload: any = {};
    cleanForm(this.loginForm);
    apiPayload.username = this.loginForm.value.userName;
    apiPayload.password = this.loginForm.value.password;
    return apiPayload;
  }

  submitForm() {
    this.auth.clearLocalStorage();
    this.submitted = true;
    if (this.loginForm.valid) {
      this.loading = true;
      this.userService
        .login(this.loginApiPayload())
        .toPromise()
        .then((res: any) => {
          if (res.token) {
            let data = res.user;
            //delete data.qbid;
            // check qbid key is present
            this.auth.setUserBS(data),
              this.auth.setApplicationToken(res.token, data);

            if (!data.qbid) {
              this.registerQuickBlox(data);
            }
            // login
           // this.doLogin(this.auth.currentUserValue.emailId);

            if (data.forceToChangePassword != undefined || data.hasOwnProperty('forceToChangePassword')) {
              if (data.forceToChangePassword) {
                this.router.navigateByUrl(
                  UrlService.USER_PAGE.UPDATE_PASSWORD_URL
                );
                return false;
              }
            }
            this.router.navigateByUrl(
              UrlService.USER_PAGE.DASHBOARD_URL);
          } else if (res.error)
            this.utilityService.alertMessage('error', res.error, 'Login Failed');
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          this.utilityService.alertMessage(
            'error',
            'Please verify your credentials.'
          );
        });
    }
  }

  doLogin(email) {
    //let res :any={user :{
    //token :"fc4458ba72242954db4b17410ffe1b2985a137602a33feff1600c9" } };
    if (this.loginForm.valid) {
      this.mesiboApi.userAdd(email).toPromise().then((res: any) => {
        if (res.result) {
          console.log(res.user.token, ' Mesibo login response');
          this.chatService.init(res.user.token),
            this.chatService.selfUser.token = res.user.token;
          this.chatService.selfUser.address = this.loginForm.value.email;
          this.chatService.selfUser.name = this.loginForm.value.email;
        }
      }).catch(err => {

      });
    }
  }


  registerQuickBlox(data) {
    this.qbService.init(),
      this.qbService.appSession().then(res => {
        this.qbService.getUser({ login: data.emailId }).then(res => {
          if (res.id) {
            this.updateQid(data.emailId, res.id);
          }
        }).catch(error => {
          let params = {
            login: data.emailId,
            full_name: data.firstName,
            email: data.emailId
          }
          this.qbService.registerUser(params).then(res => {
            if (res.id) {
              this.updateQid(data.emailId, res.id);
            }
          });
        });
      });
  }

  updateQid(email, id) {
    if (!email)
      return;
    // update local storage 
    this.auth.setQuickBloxId(id),
      // Set event user data updated
      this.qbService.setEvent("UPDATE_USER_DATA", null, true);
    this.userService.updateQbid(email, id).toPromise().then((res: any) => {
      if (res.error) {
        this.utilityService.alertMessage('error', res.error);
        // let data: any = this.auth.currentUserValue;
        // data.qbid = id;
        // this.auth.setUserBS(data)
        //return false;
      }
    });
  }

  handleKeyPress(evn) {
    if (evn.keyCode == 13) {
      this.submitForm();
    }
  }

  ngOnDestroy() {
    this.initVariable();
    this.initLoginForm();
  }
}
