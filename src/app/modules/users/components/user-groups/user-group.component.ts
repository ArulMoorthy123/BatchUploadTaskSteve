import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { environment } from 'src/environments/environment';
import { SearchFilterPipe } from '../../helpers/search-filter-pipe';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';


@Component({
  selector: 'user-group',
  templateUrl: './user-group.component.html',
  styleUrls: ['./user-group.component.scss']
})

export class UserGroupComponent implements OnInit {

  userGroupForm:FormGroup;
  groupSearchForm : FormGroup;
  createPostForm: FormGroup;
  editGroupForm: FormGroup;
  modalRef: BsModalRef;
  env = environment;

  currentUser:any;
  userGroupList :any;
  userConnectionList :any;
  dropdownSettings: any = {};
  selectedFiles: any[] = [];
  imageSizeMsg:any;
  disabled:boolean = false;
  submitted:boolean = false;
  postSubmitted:boolean  = false;
  imageSize :number = 0;
  exceedNumberOfImages:boolean = false;
  currentPage: number = 1;
  returnedArray :any;
  filteredArray:any;
  searchText: string;
  loading: boolean;
  groupIdtoDelete: any;
  selectedGroupName: string;
  selectedGroup: any;
  editFormMemberList: any;
  format: string;

  @ViewChild('multiSelect') multiSelect;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  editFormUserList: any[];

  public Editor = ClassicEditor;
  ckConfig: any = {
    toolbar: [ 'heading', '|',
     'bold',
     'italic' ,
     'numberedList',
     'bulletedList',
     'Link',
     'blockQuote',
     'undo',
     'redo'
    ],

   };


  constructor(public auth:AuthService,private userService :UsersService,private fb: FormBuilder,
    private searchPipe : SearchFilterPipe,private changeDetector: ChangeDetectorRef,
    private utilityService :UtilityService,private modalService: BsModalService) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('userDetails'));
    this.initForm();
    this.initGroupSearchForm();
    this.initCreatePostForm();
    this.initMemberSearchForm();
    this.initSelectBox();
    this.getUserGroups();
    this.getUserConnections();
  }

  initForm() {
    this.userGroupForm = new FormGroup({
      groupName: new FormControl(null, [Validators.required]),
      groupImage: new FormControl(null),
      description: new FormControl(null, [Validators.required]),
      selectedConnectionList: new FormControl(null)
    });
  }

  initGroupSearchForm() {
    this.groupSearchForm = new FormGroup({
      searchText: new FormControl(null),
    });
    this.groupSearchForm.get('searchText').valueChanges
      .subscribe(value => {
          this.searchContent(value);
    });
  }

  initCreatePostForm() {
    this.createPostForm = new FormGroup({
      groupId: new FormControl('',[Validators.required ]),
      postContent: new FormControl('',[Validators.required ]),
      postFiles: new FormControl(null),
      postImages: new FormControl(null),
      postVideos: new FormControl(null),
      //primaryFiles: this.fb.array([]),
      //primaryFiles: new FormControl('',[Validators.required ]),
      isPrivate: new FormControl(true),
    });
  }

  onCheckboxChange(e) {
    const checkArray: FormArray = this.createPostForm.get('primaryFiles') as FormArray;
    if (e.target.checked) {
      checkArray.push(new FormControl(e.target.value));
    } else {
      let i: number = 0;
      checkArray.controls.forEach((item: FormControl) => {
        if (item.value == e.target.value) {
          checkArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }


  initMemberSearchForm() {
    this.editGroupForm = new FormGroup({
      searchGroupMember: new FormControl(null),
    });
    this.editGroupForm.get('searchGroupMember').valueChanges
      .subscribe(value => {
          this.searchGroupMember(value);
    });
  }

  initSelectBox(){
    this.dropdownSettings = {
        singleSelection: false,
        idField: 'userId',
        textField: 'email',
        itemsShowLimit: 10,
        allowSearchFilter: true,
        clearSearchFilter: true,
        enableCheckAll:true,
        maxHeight: 100

    };
  }

  getUserGroups(){
    this.loading = true;
    this.userService.getUserGroups(this.currentUser.id).toPromise().then(result => {
      if(result) {
        this.userGroupList = result;
        if(this.selectedGroup!=null){
          let updatedGroup = this.filterValue(result, "id", this.selectedGroup.id);
          //console.log("updatedGroup ->" , updatedGroup);
          this.populateGroupMembers(updatedGroup);
        }
        this.searchContent("");
      }
      else {
        this.userGroupList = [];
        this.searchContent("");
      }
      this.loading = false;
    }).catch(err => {
      this.userGroupList = [];
      this.searchContent("");
      this.loading = false;
    });
  }

  searchContent(searchText){
    this.filteredArray =   this.searchPipe.transform(this.userGroupList,searchText);
    this.changeDetector.detectChanges();
    this.returnedArray = this.filteredArray.slice(0, 5);
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.returnedArray = this.userGroupList.slice(startItem, endItem);
  }

  createPostPopUp(id , selectedGroup , template){
    this.selectedGroup = selectedGroup;
    this.createPostForm.patchValue({ groupId: id });
    this.createPostForm.patchValue({ postContent: '' });
    this.createPostForm.patchValue({ postFiles: '' });
    this.createPostForm.patchValue({ postImages: '' });
    this.createPostForm.patchValue({ postVideos: '' });
    this.openLargeModal(template);
  }

  deleteImage(id,fileName){
    this.selectedFiles.splice(id, 1);
  }

  createPostAPIPayload(){
    let formData = new FormData();
    let apiPayload: any = {};

    apiPayload.groupId = this.createPostForm.value.groupId;
    apiPayload.content = this.createPostForm.value.postContent;
    apiPayload.createdBy = this.currentUser.id;
    apiPayload.isPrivate = true //this.createPostForm.value.isPrivate;
    if(this.createPostForm.value.primaryFiles != null && this.createPostForm.value.primaryFiles !=''){
      apiPayload.primaryFiles = this.createPostForm.value.primaryFiles;
    }

    Object.keys(apiPayload).forEach(key=>{
        formData.append(key,apiPayload[key]);
    });

   /* let primaryFilesArray = this.createPostForm.value.primaryFiles;

    if(primaryFilesArray !=null && primaryFilesArray.length>0)
    {
        Object.keys(primaryFilesArray).forEach(key=>{
          formData.append("primaryFiles",primaryFilesArray[key]);
      });
    } */

    if(this.selectedFiles !=null && this.selectedFiles.length>0)
    {
      Object.keys(this.selectedFiles).forEach(key=>{
        formData.append('files',this.selectedFiles[key].file);
      });
    }

    return formData;
  }

  createPost(){
    let apiFormData = this.createPostAPIPayload();
    this.postSubmitted = true;

    if(this.createPostForm.valid){
      this.modalRef.hide();
      this.loading = true;
      this.userService.createPost(apiFormData).toPromise().then((res:any) => {
        if(res.success) {
          this.utilityService.alertMessage('success','Post created Successfully');
        }
        else {
          this.utilityService.alertMessage('error','Unable to create post');
        }
        this.loading = false;
        this.postSubmitted = false;
        this.selectedFiles = [];
      }).catch(err => {
        this.utilityService.alertMessage('error','Unable to create post');
        this.loading = false;
        this.postSubmitted = false;
        this.selectedFiles = [];
      });
      }

  }



  searchGroupMember(searchText){
    this.editFormUserList =   this.searchPipe.transform(this.editFormMemberList,searchText);
    this.changeDetector.detectChanges();
  }

  makeEditMemeberList(connList , memberList){
    for(var i = 0, l = connList.length; i < l; i++) {
      for(var j = 0, ll = memberList.length; j < ll; j++) {
          if(connList[i].userId === memberList[j].id) {
            connList[i].groupMember = true;
            //tconnList.splice(i, 1, memberList[j]);
              break;
          } else {
            connList[i].groupMember = false;
          }
         }
      }
    return connList.sort(this.compare);
  }

  compare(a, b) {
    const bandA = a.groupMember;
    const bandB = b.groupMember;
    let comparison = 0;
    if (bandA) {
      comparison = -1;
    } else if (bandB) {
      comparison = 1;
    }
    return comparison;
  }

  editGroupPopUp(selectedGroup , template){
    this.selectedGroup = null;
    this.selectedGroup = selectedGroup;
    this.populateGroupMembers(this.selectedGroup);
    this.openLargeModal(template);
  }

  populateGroupMembers(selectedGroup){
    this.editFormMemberList = [];
    this.editFormMemberList = this.makeEditMemeberList(this.userConnectionList , selectedGroup.memberList);
    this.searchGroupMember('');
  }

  editGroupMember(selectedGroup ,userId){
    this.loading = true;
    let payload:any={};
    payload.groupId = selectedGroup.id;
    payload.userIds = userId;
    payload.createdBy = this.currentUser.id;

    let formData = new FormData();

    Object.keys(payload).forEach(key=>{
      formData.append(key,payload[key]);
     });

      this.userService.editMember(formData).toPromise().then((res:any)=> {
        if(res.groupMemberUpdated) {
          this.utilityService.alertMessage("success",'Member added successfully');
        }
        else {
          this.utilityService.alertMessage("error",'Member additiion Failed');
        }
        this.getUserGroups();
        this.submitted = false;
        this.loading = false;

      }).catch(err => {
        this.utilityService.alertMessage("error",'Member additiion Failed');
        this.getUserGroups();
        this.submitted = false;
        this.loading = false;
      });
  }

   filterValue(obj, key, value) {
    return obj.find(function(v){ return v[key] === value});
  }

  deleteGroupMember(selectedGroup , userId){
    this.loading = true;
    let payload:any={};
    payload.groupId = selectedGroup.id;
    payload.userIds = userId;
    payload.createdBy = this.currentUser.id;

    let formData = new FormData();

    Object.keys(payload).forEach(key=>{
      formData.append(key,payload[key]);
     });

      this.userService.deleteMember(formData).toPromise().then((res:any)=> {
        if(res.groupMemberDeleted) {
          this.utilityService.alertMessage("success",'Member deleted successfully');
        }
        else {
          this.utilityService.alertMessage("error",'Member deletion Failed');
        }
        this.getUserGroups();
        this.submitted = false;
        this.loading = false;

      }).catch(err => {
        this.utilityService.alertMessage("error",'Member deletion Failed');
        this.getUserGroups();
        this.submitted = false;
        this.loading = false;
      });
  }



  deleteUserGroup(){
    this.loading = true;
    if(this.groupIdtoDelete != null){
      this.userService.deleteGroup(this.groupIdtoDelete).toPromise().then((res:any) => {
        if(res.groupDeleted) {
          this.utilityService.alertMessage("success",'Group deleted successfully');
        }
        else {
          this.utilityService.alertMessage("error",'Unable to delete group');
        }
        this.loading = false;
        this.getUserGroups();
      }).catch(err => {
        this.utilityService.alertMessage("error",'Unable to delete group');
        this.loading = false;
        this.getUserGroups();
      });
    }
    else {
      this.utilityService.alertMessage("error",'Invalid or blank group');
    }
  }


  getUserConnections(){
    this.userService.getConnections(this.currentUser.emailId).toPromise().then(result => {
      if(result) {
        this.userConnectionList = result;
      }
      else {
        this.userConnectionList = [];
      }
    }).catch(err => {
      this.userConnectionList = [];
    });
  }

  handleImageInput(event) {

    this.exceedNumberOfImages = false;
    this.imageSize = 0;
    this.selectedFiles =[];
    if(event.target.files.length>3){
       this.exceedNumberOfImages = true;
       //alert("Only 3 image is allowed");
    }
    else {
      for (var i = 0; i < event.target.files.length; i++) {
        this.selectedFiles.push({
          file: event.target.files[i],
          url: window.URL.createObjectURL(event.target.files[i]),
          fileName: event.target.files[i].name,
          format: 'image'
        });
        this.readURL(this.selectedFiles.length - 1, event.target.files[i]);
        this.imageSize=this.imageSize+event.target.files[i].size ;
      }
    }
    event.target.value = '';
  }

  handleVideoInput(event) {

     this.imageSize = 0;
     this.selectedFiles =[];
     for (var i = 0; i <event.target.files.length; i++) {
       this.selectedFiles.push({
         file: event.target.files[i],
         url: window.URL.createObjectURL(event.target.files[i]),
         fileName: event.target.files[i].name,
         format: 'video'
       });

       this.readURL(this.selectedFiles.length - 1, event.target.files[i]);
       this.imageSize=this.imageSize+event.target.files[i].size ;
     }
     event.target.value = '';
   }

   handleFileInput(event) {
    this.imageSize = 0;
    this.selectedFiles =[];
    for (var i = 0; i < event.target.files.length ; i++) {
      this.selectedFiles.push({
        file: event.target.files[i],
        url: window.URL.createObjectURL(event.target.files[i]),
        fileName: event.target.files[i].name,
        format: 'document'
      });
      this.imageSize=this.imageSize+event.target.files[i].size ;
    }
    event.target.value = '';

   }

   handleGroupImageInput(files: FileList) {
    this.imageSize = 0;
    this.selectedFiles =[];
    for (var i = 0; i < files.length ; i++) {
      this.selectedFiles.push({
        file: files[i],
        url: window.URL.createObjectURL(files[i]),
        fileName: files[i].name,
        format: 'image'
      });
      this.imageSize=this.imageSize+files[i].size ;
    }
   }

  handleFileInputOld(files: FileList) {
    this.imageSize = 0;
    this.selectedFiles =[];
    for (var i = 0; i < files.length; i++) {
      //console.log("File Object Details:-> " , files[i]);
      if(files[i].type.indexOf('image')> -1){
        this.selectedFiles.push({
          file: files[i],
          url: window.URL.createObjectURL(files[i]),
          fileName: files[i].name,
          format: 'image'
        });
        this.readURL(this.selectedFiles.length - 1, files[i]);
        this.imageSize=this.imageSize+files[i].size ;
      } else if(files[i].type.indexOf('video')> -1){
        this.selectedFiles.push({
          file: files[i],
          url: window.URL.createObjectURL(files[i]),
          fileName: files[i].name,
          format: 'video'
        });
        this.readURL(this.selectedFiles.length - 1, files[i]);
      }
      else {
        this.selectedFiles.push({
          file: files[i],
          url: window.URL.createObjectURL(files[i]),
          fileName: files[i].name,
          format: 'document'
        });
      }
    }
  }

  readURL(index, file) {
    var reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedFiles[index].dataUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  apiPayload() {

    let payload:any={};
    let userIds = {};
    payload.groupName = this.userGroupForm.value.groupName;
    payload.description = this.userGroupForm.value.description;
    payload.createdBy = this.currentUser.id;

    let selectedConnections = this.userGroupForm.value.selectedConnectionList;

    if(selectedConnections !=null && selectedConnections.length>0) {
      for (let i=0; i < selectedConnections.length ; i++) {
        userIds[i] = selectedConnections[i].userId;
      }
    }


    let formData = new FormData();

    Object.keys(payload).forEach(key=>{
      formData.append(key,payload[key]);
     });

    if(this.selectedFiles !=null && this.selectedFiles.length>0)
    {
      Object.keys(this.selectedFiles).forEach(key=>{
        formData.append('groupImage',this.selectedFiles[key].file);
      });
    }

    Object.keys(userIds).forEach(key=>{
      formData.append('userIds',userIds[key]);
     });

     return formData;

  }

  submitForm(){
    this.submitted = true;
    let formData = this.apiPayload();
    if(this.userGroupForm.valid){
      if(this.imageSize >= 10214400)
      {
        this.imageSizeMsg = "Maximum of files Size exceeded. Limit is 10MB at most."
         this.selectedFiles =[];
         return false;
      }
    this.loading = true;
    this.resetForm();
    this.userService.createGroup(formData).toPromise().then((res:any)=> {
      if(res.groupCreated) {
        this.utilityService.alertMessage("success",'Group created successfully');
      }
      else {
        this.utilityService.alertMessage("error",'Group creation Failed');
      }
      this.getUserGroups();
      this.submitted = false;
      this.loading = false;

    }).catch(err => {
      this.utilityService.alertMessage("error",'Group creation Failed');
      this.getUserGroups();
      this.submitted = false;
      this.loading = false;
    });
  }
  }


  resetForm(){
    this.userGroupForm.patchValue({groupName: null,});
    this.userGroupForm.patchValue({groupImage: null,});
    this.userGroupForm.patchValue({description: null,});
    this.userGroupForm.patchValue({selectedConnectionList: null,});
  }



   /** start modal function */

   openSmallModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'warning_modal'});
  }

   openLargeModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
  }

   openConfirmDeletePopUp(groupId,  template) {
    this.groupIdtoDelete = groupId;
    this.openSmallModal(template);
  }

  confirm(): void {
    this.modalRef.hide();
    this.deleteUserGroup();
  }

  decline(): void {
    this.modalRef.hide();
    this.selectedFiles = [];
  }

   /** end modal related function */

}
