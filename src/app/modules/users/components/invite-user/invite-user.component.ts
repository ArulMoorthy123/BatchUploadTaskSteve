import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {UtilityService} from '../../../../shared/services/utility.service'
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { cleanForm } from '../../../../shared/helper/utilityHelper';
@Component({
  selector: 'app-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.scss']
})
export class InviteUserComponent implements OnInit {
  inviteForm:FormGroup;
  submitted: boolean = false;
  loading:boolean = false;
  constructor(private utilityService :UtilityService,private userService:UsersService,
    private auth :AuthService) { }

  ngOnInit(): void {
    this.initVariable();
    this.initInviteForm();
  }

  initVariable() {
    this.submitted = false;
    this.loading=false;
  }


  initInviteForm() {
    this.inviteForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]),
    });
  }

  inviteApiPayload() {
    let apiPayload: any = {};
    cleanForm(this.inviteForm),
    apiPayload.email = this.inviteForm.value.email;
    return apiPayload;
  }
  submitForm() {
    this.submitted = true;
    if (this.inviteForm.valid) {
      this.loading=true;
      let currentUserId=this.auth.currentUserValue.id;
     this.userService.inviteUser(this.inviteForm.value.email,currentUserId).toPromise().then((res:any) => {
      if(res.error){
        this.utilityService.alertMessage('error', res.error , 'Invitation sent Failed');
      }else {
        this.initInviteForm();
        this.utilityService.alertMessage('success','Invitation sent Successfully');
      }
      this.loading=false;
     }).catch(error=>{
       this.loading=false;
      this.utilityService.alertMessage('error','Invitation sent Failed');
     });

    }

  }
}
