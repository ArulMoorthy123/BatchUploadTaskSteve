import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { UtilityService } from '../../../../../shared/services/utility.service';
import { KeyValue } from '@angular/common';

const GENDER_OPTION = {
  'Select': '',
  'Male': 'Male',
  'Female': 'Female',
  'Prefer not to answer': 'Prefer Not to Answer',
  'Other': 'Other'
}

@Component({
  selector: 'app-profile-contact-details',
  templateUrl: './profile-contact-details.component.html',
  styleUrls: ['./profile-contact-details.component.scss'],
})
export class ProfileContactDetailsComponent implements OnInit, OnDestroy {
  submitted: boolean;
  loading: boolean;
  basicDetailsForm: FormGroup;
  _userProfileData: any;
  optGender = GENDER_OPTION;

  @Input() public set userProfileData(userProfileData: any) {
    this._userProfileData = userProfileData;
    this.fillFormWithData();
  }

  @Output() reloadProfileEvent = new EventEmitter<string>();

  constructor(
    private userService: UsersService,
    private utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.initVariable();
    this.initForm();
  }

  fillFormWithData() {
    console.log(this._userProfileData, 'Basic Details');
    if (this._userProfileData) {
      this.basicDetailsForm.patchValue({
        firstName: this._userProfileData.firstName,
        lastName: this._userProfileData.lastName,
        nationality: this._userProfileData.nationality || '',
        gender: this._userProfileData.gender || '',
        emailId: this._userProfileData.emailId,
        mobileNumber: this._userProfileData.mobileNumber || '',

        addressLine1: this._userProfileData.addressLine1 || '',
        addressLine2: this._userProfileData.addressLine2 || '',
        city: this._userProfileData.city || '',
        state: this._userProfileData.state || '',
        zipCode: this._userProfileData.zipCode || '',
        country: this._userProfileData.country || ''
      });
    }
  }

  initVariable() {
    this.submitted = false;
    this.loading = false;
  }

  initForm() {
    this.basicDetailsForm = new FormGroup({
      firstName: new FormControl({ value: null }, [Validators.required]),
      lastName: new FormControl({ value: null }, [Validators.required]),
      nationality: new FormControl(null),
      gender: new FormControl(''),
      emailId: new FormControl({ value: '' }, [Validators.required]),
      mobileNumber: new FormControl('', [
        Validators.pattern(`^([0|\\+[0-9]{1,5})?([1-9][0-9]{9})$`),
      ]),
      zipCode: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
      state: new FormControl(null, [Validators.required]),
      addressLine1: new FormControl(null),
      addressLine2: new FormControl(null),
    });
  }

  apiPayload() {
    let payload: any = {
      isBasicDetail: true,
      firstName: this._userProfileData.firstName,
      lastName: this._userProfileData.lastName,
      nationality: this.basicDetailsForm.value.nationality || '',
      gender: this.basicDetailsForm.value.gender || '',
      emailId: this._userProfileData.emailId,
      isContactDetail: true,
      mobileNumber: this.basicDetailsForm.value.mobileNumber || '',
      zipCode: this.basicDetailsForm.value.zipCode || '',
      city: this.basicDetailsForm.value.city || '',
      country: this.basicDetailsForm.value.country || '',
      state: this.basicDetailsForm.value.state || '',
      addressLine1: this.basicDetailsForm.value.addressLine1 || '',
      addressLine2: this.basicDetailsForm.value.addressLine2 || '',
    };

    let formData = new FormData();
    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });
    return formData;
  }

  submitForm() {
    this.submitted = true;
    if (this.basicDetailsForm.valid) {
      this.loading = true;
      this.userService
        .saveProfile(this.apiPayload())
        .toPromise()
        .then((res: any) => {
          if (res.profileUpdate) {
            this.utilityService.alertMessage(
              'success',
              'Profile Basic Details Updated'
            );
          }
          this.loading = false;
          this.reloadProfileEvent.next();
        })
        .catch((err) => {
          this.utilityService.alertMessage(
            'error',
            'Profile Basic Details Failed'
          );
          this.loading = false;
          this.reloadProfileEvent.next();
        });
    }
  }
  originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return 0;
  }

  ngOnDestroy(): void {
    this.initVariable();
    this.initForm();
  }
}
