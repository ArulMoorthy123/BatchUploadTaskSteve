import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  activeTab:string="BASIC";
  userProfileData:any;
  selectedImages: any[] = [];
  imageSizeMsg;
  mainProfileForm:FormGroup;
  loading:boolean;
  profileImageUrl=null;
  currentUser:any;
  modalRef: BsModalRef;

  constructor(private userService :UsersService,private utilityService :UtilityService,
    private auth : AuthService,private modalService: BsModalService) { }

  ngOnInit(): void {
    this.activeTab="BASIC";
    this.getProfile();
    this.initForm();
  }

changeTab(name="BASIC"){
  this.activeTab=name;
}
getProfile() {
  this.currentUser = JSON.parse(localStorage.getItem('userDetails'));
  this.loading = true;
  this.userService.getProfile(this.currentUser.id).toPromise().then(res => {
    if(res) {
      this.userProfileData=res;
      this.profileImageUrl = null;
      if(this.userProfileData.profileImageUrl){
        this.profileImageUrl = environment.apiurl+this.userProfileData.profileImageUrl;
      }
      this.auth.setUserBS(this.userProfileData);
      this.resetUserData(this.userProfileData);
    }
    this.loading = false;
  }).catch(err => {
    this.loading = false;
  });;
}

resetUserData(user) {
  localStorage.setItem('userDetails', JSON.stringify(user));
}

  initForm() {
    this.mainProfileForm = new FormGroup({
      userProfileImage: new FormControl("")
    });
  }

  handleImageInput(files: FileList) {
  let size=0;
  this.selectedImages =[];
  for (var i = 0; i < files.length; i++) {
    this.selectedImages.push({
      file: files[i],
      url: window.URL.createObjectURL(files[i]),
      fileName: files[i].name
    });
    this.readURL(this.selectedImages.length - 1, files[i]);
    size=size +files[i].size
  }
  if(size >= 10214400)
  {
    this.imageSizeMsg = "Maximum of files Size exceeded. Limit is 10MB at most."
     this.selectedImages =[];
  }
  else {
    this.submitForm();
  }
}

  readURL(index, file) {
    var reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedImages[index].dataUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

   apiPayload(){
    let payload:any ={};
    payload.isBasicDetail=false;
    payload.emailId=this.userProfileData.emailId;

    let formData = new FormData();
    if(this.selectedImages !=null && this.selectedImages.length>0)
    {
      Object.keys(this.selectedImages).forEach(key=>{
        formData.append('profileImage',this.selectedImages[key].file);
      });
    }
    else {
        payload.isDeleteProfileImage = true;
    }
    Object.keys(payload).forEach(key=>{
      formData.append(key,payload[key]);
    });
    return formData;
  }

  async submitForm(){
    this.loading=true;

    let formData = await this.apiPayload();

    this.userService.saveProfile(formData).toPromise().then((res:any)=> {
      if(res.profileUpdate) {
        this.utilityService.alertMessage("success",'Profile Image Updated');
      }
      else {
            this.utilityService.alertMessage("error",res.error);
      }
      this.loading=false;
      this.getProfile();
    }).catch(err => {
      this.utilityService.alertMessage("error",'Profile Image Updated Failed');
      this.loading=false;
      this.getProfile();
    });

  }

  deleteImage(){
    this.selectedImages =[];
    this.submitForm();
  }

  openConfirmDeletePopUp(template) {
    this.openSmallModal(template);
  }

  /** start modal function */

  openSmallModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'warning_modal'});
  }

  confirm(): void {
    this.modalRef.hide();
    this.deleteImage();
  }

  decline(): void {
    this.modalRef.hide();
  }

  ngOnDestroy() {
  }

}
