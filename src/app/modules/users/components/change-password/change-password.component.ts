import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UrlService } from 'src/app/shared/services/url.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  changePasswordToken:any;
  constructor(private route: ActivatedRoute,private userService: UsersService,
    private utilityService :UtilityService, private authServie : AuthService,private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.changePasswordToken = params['token'];
      if (this.changePasswordToken) {
          this.logout();
      }
    });
    this.initVariable();
    this.initChangePasswordForm();
  }

  initVariable() {
    this.submitted = false;
    this.loading = false;
  }

  logout(){
    this.authServie.clearLocalStorage();
    this.authServie.clearSubscribe();
  }

  initChangePasswordForm() {
    this.changePasswordForm = new FormGroup(
      {
        password: new FormControl(null, [Validators.required]),
        confirmPassword: new FormControl(null, [Validators.required]),
      },
      confirmNewPasswordValidator
    );
  }

  apiPayload() {
    let payload:any={};
    payload.confirmPassword = this.changePasswordForm.value.password;
    payload.password = this.changePasswordForm.value.confirmPassword
    payload.token =  this.changePasswordToken;
    return payload;
  }

  submitForm() {
    this.submitted = true;
    if (this.changePasswordForm.valid) {
      this.loading=true;
      this.userService.resetPassword(this.apiPayload()).toPromise().then((res:any)=> {
      if(res.success) {
        this.utilityService.alertMessage("success",res.success);
        this.router.navigateByUrl(UrlService.PUBLIC_PAGE.HOME_URL);
      }
      if(res.error) {
        this.utilityService.alertMessage("error",res.error);
      }
      this.loading=false;
     }).catch(err => {
      this.utilityService.alertMessage("error",'Error in password change');
      this.loading=false;
    });
  }
}

handleKeyPress(evn) {
  if (evn.keyCode == 13) {
    this.submitForm();
  }
}

  ngOnDestroy() {
    this.initVariable();
    this.initChangePasswordForm();
  }
}

function confirmNewPasswordValidator( findForm: AbstractControl): { [s: string]: boolean } {
  if ( findForm.get('password').value !== findForm.get('confirmPassword').value ) {
    return { isConfirmNewPasswordNotSame: true };
  }
  return null;
}
