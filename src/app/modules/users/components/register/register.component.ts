import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';

import { AuthService } from './../../services/auth.service';
import { UtilityService } from '../../../../shared/services/utility.service';
import { UsersService } from '../../services/users.service';
import {
  isEmailUniqueValidation,
  isMobileUniqueValidation,
  cleanForm,
} from '../../../../shared/helper/utilityHelper';
import { ActivatedRoute, Router } from '@angular/router';
import { UrlService } from 'src/app/shared/services/url.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit,OnDestroy {


  regForm: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  mobileCheckingLoader: boolean = false;
  emailCheckingloader: boolean = false;
  invitationCode:string;
  emailId:string;
  referedBy:string;
  constructor(
    private auth: AuthService,
    private utilityService: UtilityService,
    private route: ActivatedRoute,
    private userService: UsersService,
    private router: Router,
  ) {}

  ngOnInit(): void {

    this.initVariable();
    if (this.auth.loginStatus()) {
      this.auth.redirectToHome();
    }
    this.route.queryParams.subscribe(params => {
      this.invitationCode = params['inviateCode']?params['inviateCode']:'';
      this.emailId = params['referedemail']?params['referedemail']:'';
      this.referedBy = params['referedBy']?params['referedBy']:'';

    });
    this.initRegForm();
    console.log(this.invitationCode + ' invitation code');
  }

  initVariable() {
    this.submitted = false;
    this.loading = false;
    this.emailCheckingloader = false;
    this.mobileCheckingLoader = false;
    this.invitationCode='';
    this.emailId='';
  }

  initRegForm() {
    this.regForm = new FormGroup(
      {
        firstName: new FormControl(null, [
          Validators.required,
          Validators.max(50),
          Validators.min(3),
          Validators.pattern(`^(?=.{1,50}$)[a-zA-Z]+(?:['_.^\s][a-zA-Z]+)*$`),
        ]),
        lastName: new FormControl(null, [
          Validators.required,
          Validators.max(50),
          Validators.min(2),
          Validators.pattern(`^(?=.{1,50}$)[a-zA-Z]+(?:['_.^\s][a-zA-Z]+)*$`),
        ]),
        email: new FormControl(
          this.emailId,
          [
            Validators.required,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
          ],
          [isEmailUniqueValidation.bind(this)]
        ),
        invitationCode: new FormControl(this.invitationCode, [Validators.required]),
        phone: new FormControl(
          '',
          [
            Validators.pattern(`^([0|\\+[0-9]{1,5})?([1-9][0-9]{9})$`),
          ],
          //[isMobileUniqueValidation.bind(this)]
        ),
        password: new FormControl(null, [Validators.required]),
        confirmPassword: new FormControl(null, [Validators.required]),
        term: new FormControl(false, [Validators.pattern('true')]),
      },
      confirmNewPasswordValidator
    );
  }

  registerApiPayload() {
    let apiPayload: any = {};
    cleanForm(this.regForm);
    apiPayload.emailId = this.emailId?this.emailId:this.regForm.value.email;
    apiPayload.firstName = this.regForm.value.firstName;
    apiPayload.lastName = this.regForm.value.lastName;
    apiPayload.invitationCode = this.invitationCode?this.invitationCode:this.regForm.value.invitationCode;
    apiPayload.mobileNumber = this.regForm.value.phone;
    apiPayload.password = this.regForm.value.password;
    apiPayload.referedBy = this.referedBy;
    return apiPayload;
  }

  submitForm() {
    this.submitted = true;
    if (this.regForm.valid) {
      this.loading = true;
      this.userService
        .registeruser(this.registerApiPayload())
        .toPromise()
        .then((res: any) => {
          if (res.error) {
            this.utilityService.alertMessage('error', res.error);
          }else {
            this.utilityService.alertMessage('success', 'Register Successfully');
            this.router.navigateByUrl(UrlService.PUBLIC_PAGE.HOME_URL);
          }
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          this.utilityService.alertMessage('error', 'Registration Failed');
        });
    }
  }

  handleKeyPress(evn) {
    if (evn.keyCode == 13) {
      this.submitForm();
    }
  }

  ngOnDestroy() {
    this.initRegForm();
    this.initVariable();
  }

}

function confirmNewPasswordValidator( findForm: AbstractControl): { [s: string]: boolean } {
  if ( findForm.get('password').value !== findForm.get('confirmPassword').value ) {
    return { isConfirmNewPasswordNotSame: true };
  }
  return null;
}
