import { Component, OnInit, OnDestroy, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { UtilityService } from '../../../../shared/services/utility.service';
import * as moment from 'moment';

@Component({
  selector: 'app-user-basic-details',
  templateUrl: './user-basic-details.component.html',
  styleUrls: ['./user-basic-details.component.scss']
})
export class UserBasicDetailsComponent implements OnInit,OnDestroy {
  submitted:boolean;
  loading:boolean;
  basicDetailsForm:FormGroup
  _userProfileData:any;
  maxDate: Date;

  @Input() public set userProfileData(userProfileData: any) {
    this._userProfileData = userProfileData;
    this.fillFormWithData();
  }

  @Output() reloadProfileEvent = new EventEmitter<string>();

  constructor(private userService :UsersService,
    private utilityService :UtilityService) {
      this.maxDate = new Date();
     }


  ngOnInit(): void {
    this.initVariable();
    this.initForm();
  }


  fillFormWithData() {
    console.log(this._userProfileData, 'user  form');
    if(this._userProfileData) {
      this.basicDetailsForm.patchValue( {
        firstName:this._userProfileData.firstName,
        lastName : this._userProfileData.lastName,
        nationality : this._userProfileData.nationality,
        gender : this._userProfileData.gender?this._userProfileData.gender:'',
        dob : this._userProfileData.dateOfBirth
      });
    }

  }

  initVariable() {
    this.submitted = false;
    this.loading = false;
  }

  initForm() {
    this.basicDetailsForm = new FormGroup({
      firstName: new FormControl({value:null}, [Validators.required]),
      lastName: new FormControl({value:null}, [Validators.required]),
      nationality: new FormControl(null),
      dob: new FormControl(null,),
      gender: new FormControl('',)
    });
}

apiPayload() {

  let payload:any ={};

  payload.isBasicDetail=true;
  payload.gender=this.basicDetailsForm.value.gender;
  var userDob = moment(this.basicDetailsForm.value.dob).format('MM-DD-YYYY');
  console.log(userDob);
  payload.dateOfBirth = userDob;

  payload.firstName= this.basicDetailsForm.value.firstName;
  payload.lastName= this.basicDetailsForm.value.lastName;

  payload.nationality=this.basicDetailsForm.value.nationality;
  payload.emailId=this._userProfileData.emailId;

  let formData = new FormData();
  Object.keys(payload).forEach(key=>{
       formData.append(key,payload[key]);
  });

  return formData;

}

  submitForm() {
    this.submitted=true;
    if(this.basicDetailsForm.valid){
      this.loading=true;
      this.userService.saveProfile(this.apiPayload()).toPromise().then((res:any)=> {
        if(res.profileUpdate) {
          this.utilityService.alertMessage("success",'Profile Basic Details Updated');
        }
        this.loading=false;
        this.reloadProfileEvent.next();
      }).catch(err => {
        this.utilityService.alertMessage("error",'Profile Basic Details Failed');
        this.loading=false;
        this.reloadProfileEvent.next();
      });
    }
  }

  ngOnDestroy(): void {
    this.initVariable();
    this.initForm();
  }
}
