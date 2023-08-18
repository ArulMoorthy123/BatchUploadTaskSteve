import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { UtilityService } from 'src/app/shared/services/utility.service';

import * as moment from 'moment';

@Component({
  selector: 'app-user-experience-details',
  templateUrl: './user-experience-details.component.html',
  styleUrls: ['./user-experience-details.component.scss']
})
export class UserExperienceDetailsComponent implements OnInit {

  experienceDetailsForm:FormGroup;
  _userProfileData:any;
  submitted:boolean;
  loading:boolean;
  maxDate: Date;
  minDate: Date;
  dbStartDate: Date;
  hideEndDate:boolean = false;

  @Input() public set userProfileData(userProfileData: any) {
    this._userProfileData = userProfileData;
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

  setMaxAndMinDate(){
    this.maxDate = new Date();
    this.minDate = new Date();
    this.minDate.setDate(this.maxDate.getDate() + 1);
   }

  initVariable() {
    this.submitted = false;
    this.loading = false;
  }

  initForm() {
    this.experienceDetailsForm = new FormGroup({
      occupationName: new FormControl(null, [Validators.required]),
      occupationStatus: new FormControl(null),
      employerName: new FormControl(null,[Validators.required]),
      designation: new FormControl(null),
      startdate: new FormControl(null,[Validators.required]),
      endDate: new FormControl(null),
      tillDate: new FormControl(false),
      occupationId: new FormControl("")
    });

    // on change relation dynamically
    this.experienceDetailsForm.get('startdate').valueChanges
      .subscribe(value => {
        this.minDate = new Date();
        this.dbStartDate = new Date(value);
        console.log("on date change->",this.dbStartDate);
        this.minDate.setDate(this.dbStartDate.getDate()+1);
        this.minDate.setFullYear(this.dbStartDate.getFullYear());
        this.minDate.setMonth(this.dbStartDate.getMonth());
     });

      // on change relation dynamically
    this.experienceDetailsForm.get('tillDate').valueChanges
    .subscribe(value => {

      if(value==true){
          this.hideEndDate = true;
      }
      if(value==false){
          this.hideEndDate = false;
       }
    });
}

apiPayload() {
  let payload:any={};

  payload.isExperienceDetail=true;
  payload.emailId = this._userProfileData.emailId;
  let startDate = moment(this.experienceDetailsForm.value.startdate).format('MM-DD-YYYY');
  let endDate
  if(this.experienceDetailsForm.value.endDate) {
     endDate = moment(this.experienceDetailsForm.value.endDate).format('MM-DD-YYYY');
  }
  else {
    endDate = null;
  }


  let occupationDetails = {
     'occupation[0].occupationName' : this.experienceDetailsForm.value.occupationName,
     'occupation[0].occupationStatus' : this.experienceDetailsForm.value.occupationStatus,
     'occupation[0].employerName' : this.experienceDetailsForm.value.employerName,
     'occupation[0].designation' : this.experienceDetailsForm.value.designation,
     'occupation[0].startdate' : startDate,
     'occupation[0].endDate' : endDate,
     'occupation[0].tillDate' : this.experienceDetailsForm.value.tillDate,
     'occupation[0].occupationId' : this.experienceDetailsForm.value.occupationId
    }

  let formData = new FormData();

    Object.keys(payload).forEach(key=>{
        formData.append(key,payload[key]);
    });

    Object.keys(occupationDetails).forEach(key=>{
      formData.append(key,occupationDetails[key]);
    });

    return formData;

}

submitForm(){
  this.submitted=true;
  if(this.experienceDetailsForm.valid){
    this.loading=true;
    this.userService.saveProfile(this.apiPayload()).toPromise().then((res:any)=> {
      if(res.profileUpdate) {
        this.utilityService.alertMessage("success",'Experience Details Updated');
      }
      this.loading=false;
      this.reloadProfileEvent.next();
      this.initForm();
      this.hideEndDate = false;
      this.submitted=false;
    }).catch(err => {
      this.utilityService.alertMessage("error",'Experience Details Updation Failed');
      this.loading=false;
      this.reloadProfileEvent.next();
      this.initForm();
      this.hideEndDate = false;
      this.submitted=false;
    });
  }
}

updateData(updateData){

  this.minDate = new Date();
  this.dbStartDate = new Date(updateData.startDate);

  this.minDate.setDate(this.dbStartDate.getDate()+1);
  this.minDate.setFullYear(this.dbStartDate.getFullYear());
  this.minDate.setMonth(this.dbStartDate.getMonth());

  this.experienceDetailsForm.patchValue( {
    occupationName: updateData.occupationName,
    occupationStatus :  updateData.occupationStatus,
    employerName : updateData.employerName,
    designation : updateData.designation,
    startdate : updateData.startdate,
    endDate : updateData.endDate,
    tillDate : updateData.tillDate,
    occupationId:updateData.occupationId
  });
}

}
