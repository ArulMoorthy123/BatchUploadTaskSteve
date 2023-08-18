import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-skill-details',
  templateUrl: './user-skill-details.component.html',
  styleUrls: ['./user-skill-details.component.scss']
})
export class UserSkillDetailsComponent implements OnInit {


  skillDeatilForm:FormGroup;
  disabled = false;
  ShowFilter = false;
  limitSelection = false;
  skills: any = [];
  userSkills: any = [];
  dropdownSettings: any = {};
  _userProfileData:any;

  @Input() public set userProfileData(userProfileData: any) {
    this._userProfileData = userProfileData;
    this.fillFormWithData();
  }

  @Output() reloadProfileEvent = new EventEmitter<string>();

  constructor(private userService :UsersService,private utilityService :UtilityService,
    private auth : AuthService,private fb: FormBuilder) {

    }


  ngOnInit() {
    this.initForm();
    this.initSelectBox();
  }

  fillFormWithData() {
    if(this._userProfileData) {
      this.userSkills = this._userProfileData.skill;

      this.skillDeatilForm.patchValue( {
        skill:this.userSkills
      });
    }
  }


  initForm() {
    this.skillDeatilForm = new FormGroup({
      skill: new FormControl(null)
    });
}

  initSelectBox(){
        this.skills = [
          { id: 0, name: 'Search' }
      ];
      this.dropdownSettings = {
          singleSelection: false,
          idField: 'id',
          textField: 'name',
          itemsShowLimit: 100,
          allowSearchFilter: true,
          clearSearchFilter: true,
          enableCheckAll:false
      };
  }

  onItemSelect(item: any) {
      //console.log('onItemSelect', item);
  }

  public onFilterChange(item: any) {
    let searchString = item;
    let finalSearchString = searchString.trim();

    if(finalSearchString.length>1){
      this.userService.getSkills(searchString).toPromise().then(result => {
          if(result) {
            if(result)
            this.skills = result;
            let testSkill = {id: 0, name: 'Search' };
            this.skills.push(testSkill);
          }
          else {
            this.skills = [
              { id: 0, name: 'Search' }
          ];
          }
        });
    }
    else {
          this.skills = [
            { id: 0, name: 'Search' }
        ];
    }
  }

  apiPayload() {
    let payload:any={};

    payload.isSkillDetail=true;
    payload.emailId = this._userProfileData.emailId;

    let selectedSkills = this.skillDeatilForm.value.skill;

    let skillIds = {};
    for (let i=0; i < selectedSkills.length ; i++) {
      skillIds['skill['+i+'].id'] = selectedSkills[i].id;
    }

    let skillName = {};
    for (let i=0; i < selectedSkills.length ; i++) {
      skillName['skill['+i+'].name'] = selectedSkills[i].name;
    }



    let formData = new FormData();

     Object.keys(payload).forEach(key=>{
      formData.append(key,payload[key]);
     });

     Object.keys(skillIds).forEach(key=>{
      formData.append(key,skillIds[key]);
     });

     Object.keys(skillName).forEach(key=>{
      formData.append(key,skillName[key]);
     });
     return formData;
  }

  submitForm(){

     this.userService.saveProfile(this.apiPayload()).toPromise().then((res:any)=> {
      if(res.profileUpdate) {
        this.utilityService.alertMessage("success",'Skills  Updated');
      }
      this.reloadProfileEvent.next();
    }).catch(err => {
      this.utilityService.alertMessage("error",'Updation Failed');
      this.reloadProfileEvent.next();
    });

  }


}
