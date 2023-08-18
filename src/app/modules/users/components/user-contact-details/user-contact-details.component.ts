import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { UtilityService } from 'src/app/shared/services/utility.service';

@Component({
  selector: 'app-user-contact-details',
  templateUrl: './user-contact-details.component.html',
  styleUrls: ['./user-contact-details.component.scss']
})
export class UserContactDetailsComponent implements OnInit {

  submitted:boolean;
  loading:boolean;
  contactDetailsForm:FormGroup
  _userProfileData:any;

  @Input() public set userProfileData(userProfileData: any) {
    this._userProfileData = userProfileData;
    this.fillFormWithData();
  }
  @Output() reloadProfileEvent = new EventEmitter<string>();

  constructor(private userService :UsersService,
    private utilityService :UtilityService) { }


  ngOnInit(): void {
    this.initVariable();
    this.initForm();
  }

  fillFormWithData() {
    if(this._userProfileData) {
      this.contactDetailsForm.patchValue( {
        emailId:this._userProfileData.emailId,
        alternateEmail : this._userProfileData.alternateEmail,
        mobileNumber : this._userProfileData.mobileNumber,
        alternateMobileNumber : this._userProfileData.alternateMobileNumber,
        zipCode : this._userProfileData.zipCode,
        city:this._userProfileData.city,
        country : this._userProfileData.country?this._userProfileData.country:'',
        state : this._userProfileData.state,
        addressLine1 : this._userProfileData.addressLine1,
        addressLine2 : this._userProfileData.addressLine2
      });
    }
  }

  initVariable() {
    this.submitted = false;
    this.loading = false;
  }

  initForm() {
    this.contactDetailsForm = new FormGroup({
      emailId: new FormControl(
        {value:''},
        [
          Validators.required
        ]
        ),
      
      mobileNumber: new FormControl(
        '',
       [
         Validators.pattern(`^([0|\\+[0-9]{1,5})?([1-9][0-9]{9})$`)
        ]
        ),
      zipCode: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
      state: new FormControl(null, [Validators.required]),
      addressLine1: new FormControl(null),
      addressLine2: new FormControl(null),
    });
}

apiPayload() {

  let payload:any ={};

  payload.isContactDetail=true;

  payload.emailId=this._userProfileData.emailId;
  payload.alternateEmail=this.contactDetailsForm.value.alternateEmail;
  payload.mobileNumber=this.contactDetailsForm.value.mobileNumber;
  payload.alternateMobileNumber=this.contactDetailsForm.value.alternateMobileNumber;

  payload.zipCode=this.contactDetailsForm.value.zipCode;
  payload.city=this.contactDetailsForm.value.city;
  payload.country=this.contactDetailsForm.value.country;
  payload.state=this.contactDetailsForm.value.state;
  payload.addressLine1=this.contactDetailsForm.value.addressLine1;
  payload.addressLine2=this.contactDetailsForm.value.addressLine2;

  let formData = new FormData();
  Object.keys(payload).forEach(key=>{
       formData.append(key,payload[key]);
  });

  return formData;

}

submitForm(){
  this.submitted=true;
  if(this.contactDetailsForm.valid){
    this.loading=true;
    this.userService.saveProfile(this.apiPayload()).toPromise().then((res:any)=> {
      if(res.profileUpdate) {
        this.utilityService.alertMessage("success",'Profile Contact Details Updated');
      }
      this.loading=false;
      this.reloadProfileEvent.next();
    }).catch(err => {
      this.utilityService.alertMessage("error",'Profile Contact Details Failed');
      this.loading=false;
      this.reloadProfileEvent.next();
    });
  }
}

}
