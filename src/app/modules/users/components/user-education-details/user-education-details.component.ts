import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import * as moment from 'moment';

@Component({
  selector: 'app-user-education-details',
  templateUrl: './user-education-details.component.html',
  styleUrls: ['./user-education-details.component.scss']
})
export class UserEducationDetailsComponent implements OnInit {


  educationDetailsForm:FormGroup;
  _userProfileData:any;
  submitted:boolean;
  loading:boolean;
  maxDate: Date;
  minDate: Date;
  dbStartDate: Date;

  @Input() public set userProfileData(userProfileData: any) {
    this._userProfileData = userProfileData;
  }

  @Output() reloadProfileEvent = new EventEmitter<string>();

  constructor(private userService :UsersService,
    private utilityService :UtilityService) {
      this.setMaxAndMinDate();
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
    this.educationDetailsForm = new FormGroup({
      qualificationType: new FormControl(null, [Validators.required]),
      institution: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
      educationId: new FormControl("")
    });

    // on change relation dynamically
    this.educationDetailsForm.get('startDate').valueChanges
      .subscribe(value => {
        this.minDate = new Date();
        this.dbStartDate = new Date(value);
        console.log("on date change->",this.dbStartDate);
        this.minDate.setDate(this.dbStartDate.getDate()+1);
        this.minDate.setFullYear(this.dbStartDate.getFullYear());
        this.minDate.setMonth(this.dbStartDate.getMonth());
     });
}

  apiPayload() {
    let payload:any={};

    payload.isEducationDetail=true;
    payload.emailId = this._userProfileData.emailId;
    let startDate = moment(this.educationDetailsForm.value.startDate).format('MM-DD-YYYY');
    let endDate = moment(this.educationDetailsForm.value.endDate).format('MM-DD-YYYY');

    let educationDetails = {
       'education[0].qualificationType' : this.educationDetailsForm.value.qualificationType,
       'education[0].institution' : this.educationDetailsForm.value.institution,
       'education[0].startDate' : startDate,
       'education[0].endDate' : endDate,
       'education[0].educationId' : this.educationDetailsForm.value.educationId
      }

    let formData = new FormData();

      Object.keys(payload).forEach(key=>{
          formData.append(key,payload[key]);
      });

      Object.keys(educationDetails).forEach(key=>{
        formData.append(key,educationDetails[key]);
      });

      return formData;

  }

  submitForm(){
    this.submitted=true;
    if(this.educationDetailsForm.valid){
      this.loading=true;
      this.userService.saveProfile(this.apiPayload()).toPromise().then((res:any)=> {
        if(res.profileUpdate) {
          this.utilityService.alertMessage("success",'Education Details Updated');
        }
        this.initForm();
        this.loading=false;
        this.reloadProfileEvent.next();
        this.setMaxAndMinDate();
        this.submitted=false;

      }).catch(err => {
        this.utilityService.alertMessage("error",'Education Details Failed');
        this.initForm();
        this.loading=false;
        this.reloadProfileEvent.next();
        this.setMaxAndMinDate();
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

    this.educationDetailsForm.patchValue( {
      qualificationType: updateData.qualificationType,
      institution :  updateData.institution,
      startDate : updateData.startDate,
      endDate : updateData.endDate,
      educationId:updateData.educationId
    });
  }


}
