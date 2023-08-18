import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {  isEmailExistValidation,cleanForm } from '../../../../shared/helper/utilityHelper';
import { UsersService } from '../../services/users.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UrlService } from 'src/app/shared/services/url.service';
import { UtilityService } from 'src/app/shared/services/utility.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit,OnDestroy {

  forgotForm: FormGroup;
  submitted: boolean = false;
  emailCheckingloader: boolean = false;
  urlServices = UrlService;
  loading : boolean = false;

  constructor(private userService: UsersService,private utilityService :UtilityService) { }

  ngOnInit(): void {
    this.initVariable();
    this.initforgotForm();
  }

  initVariable() {
    this.submitted = false;
    this.emailCheckingloader = false;
  }

  initforgotForm() {
    this.forgotForm = new FormGroup({
      'userName': new FormControl(null,
                  [
                    Validators.required,
                    Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")
                  ],
                  [isEmailExistValidation.bind(this)]
                  )
       });
  }

  forgotPasswordApiPayload() {
    let apiPayload: any = {};
    cleanForm(this.forgotForm);
    apiPayload.email = this.forgotForm.value.userName;
    return apiPayload;
  }

  submitForm() {
    this.submitted=true;
    if (this.forgotForm.valid){
        this.loading=true;
        this.userService.forgotPassword(this.forgotPasswordApiPayload().email).toPromise().then((res:any)=> {
        if(res.emailSent) {
          this.utilityService.alertMessage("success",'Email successfully send');
        }
        else {
          this.utilityService.alertMessage("error",'Error While Sending Email');
        }
        this.submitted=false;
        this.loading=false;
       }).catch(err => {
        this.utilityService.alertMessage("error",'Error While Sending Email');
        this.loading=false;
        this.submitted=false;
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
    this.initforgotForm();
  }

}
