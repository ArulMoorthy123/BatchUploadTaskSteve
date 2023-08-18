import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { cleanForm } from '../../../../shared/helper/utilityHelper';
import { AuthService } from '../../services/auth.service';
import { UtilityService } from '../../../../shared/services/utility.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnInit,OnDestroy {

  showPassword: boolean = false;
  updateForm: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  currentUser :any ;
  constructor(private userService: UsersService,
    private utilityService : UtilityService,
    private auth: AuthService) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('userDetails'));
    this.initVariable();
    this.initForm();
  }

  initVariable() {
    this.showPassword=false;
    this.submitted=false;
    this.loading=false;
  }
  initForm() {
    this.updateForm = new FormGroup(
      {
        currentPassword: new FormControl(null, [Validators.required]),
        password: new FormControl(null, [Validators.required]),
        confirmPassword: new FormControl(null, [Validators.required]),
      },
      confirmNewPasswordValidator
    );
  }


  changePasswordApiPayload() {
    let apiPayload: any = {};
    cleanForm(this.updateForm);
    apiPayload.currentPassword = this.updateForm.value.currentPassword;
    apiPayload.changedPassword = this.updateForm.value.password;
    apiPayload.email= this.currentUser.emailId;

    return apiPayload;
  }
  submitForm() {
    this.submitted = true;
    if (this.updateForm.valid) {
      this.loading = true;
      this.userService.updatePassword(this.changePasswordApiPayload()).toPromise().then((res: any) => {
         console.log(res);
        if (res) {
            this.auth.logout();
            this.utilityService.alertMessage(
              'success',
              res
            );
          }
          this.loading = false;
        }).catch((error) => {
          this.loading = false;
          this.utilityService.alertMessage(
            'error',
            'Update Password Failed.'
          );
        });
    }
  }

  handleKeyPress(evn) {
    if (evn.keyCode == 13) {
      this.submitForm();
    }
  }

  ngOnDestroy(): void {
    this.initVariable();
    this.initForm();
  }
}

function confirmNewPasswordValidator( findForm: AbstractControl): { [s: string]: boolean } {
  if ( findForm.get('password').value !== findForm.get('confirmPassword').value ) {
    return { isConfirmNewPasswordNotSame: true };
  }
  return null;
}

