import {
  Component,
  OnInit,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { UtilityService } from 'src/app/shared/services/utility.service';
import { UsersService } from '../../services/users.service';
import { environment } from 'src/environments/environment';
import { UrlService } from 'src/app/shared/services/url.service';

@Component({
  selector: 'user-post',
  templateUrl: './user-post.component.html',
  styleUrls: ['./user-post.component.scss'],
})
export class UserPostComponent implements OnInit {
  createPostForm: FormGroup;
  postCommentForm: FormGroup;
  tagPrivacyForm: FormGroup;
  env = environment;
  modalRef: BsModalRef;

  currentUser: any;
  loading: boolean = false;
  postList = new Array();
  urlServices = UrlService;
  postId: any;
  commentSubmitted: boolean = false;
  postSubmitted: boolean = false;
  selectedFiles: any[] = [];
  exceedNumberOfImages: boolean = false;
  fileSize: number;
  userProfileId: any;
  selectedUser = new Array();
  dropdownSettings: any = {};
  hideConnectionBox = true;

  @Input() userConnectionList = [];
  @ViewChild('photoInput') photoInput;
  postMediaList: any;
  commentId: any;

  private noOfItemsToShowInitially: number = 10;
  private itemsToLoad: number = 10;
  public itemsToShow: any;
  isFullListDisplayed: boolean = false;

  constructor(
    private userService: UsersService,
    private utilityService: UtilityService,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('userDetails'));
    console.log(this.currentUser);
    this.getUserPosts();
    this.initPostCommentForm();
    this.initCreatePostForm();
    this.initTagPrivacyForm();
    this.initSelectBox();
  }

  initSelectBox() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'userId',
      textField: 'fullName',
      itemsShowLimit: 10,
      allowSearchFilter: true,
      clearSearchFilter: true,
      enableCheckAll: false,
      maxHeight: 100,
    };
  }

  initPostCommentForm() {
    this.postCommentForm = new FormGroup({
      commentContent: new FormControl('', [Validators.required]),
    });
  }

  initCreatePostForm() {
    this.createPostForm = new FormGroup({
      postContent: new FormControl('', [Validators.required]),
    });
  }

  initTagPrivacyForm() {
    this.tagPrivacyForm = new FormGroup({
      privacyType: new FormControl('1'),
      selectedConnectionList: new FormControl(''),
    });

    this.tagPrivacyForm.get('privacyType').valueChanges.subscribe((value) => {
      if (value == '1' || value == 1) {
        this.hideConnectionBox = true;
        this.tagPrivacyForm.patchValue({ selectedConnectionList: null });
      }
      if (value == '2' || value == 2) {
        this.hideConnectionBox = false;
      }
    });
  }

  resetTagPrivacyForm() {
    this.tagPrivacyForm.patchValue({ privacyType: 1 });
    this.tagPrivacyForm.patchValue({ selectedConnectionList: null });
  }

  getUserPosts() {
    let formData = new FormData();

    let payload: any = {};
    payload.createdBy = this.currentUser.id;

    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });

    this.loading = true;
    this.userService
      .listPost(formData)
      .toPromise()
      .then((result: any) => {
        if (result) {
          this.postList = result;
          this.itemsToShow = this.postList.slice(
            0,
            this.noOfItemsToShowInitially
          );
        } else {
          this.postList = new Array();
        }
        this.loading = false;
      })
      .catch((err) => {
        this.postList = new Array();
        this.loading = false;
      });
  }

  deletePost(postId) {
    this.loading = true;
    this.userService
      .deletePost(postId)
      .toPromise()
      .then((result: any) => {
        if (result.success) {
          this.utilityService.alertMessage(
            'success',
            'Post deleted Successfully'
          );
        } else {
          this.utilityService.alertMessage('error', 'Unable to delete post');
        }
        this.loading = false;
        this.getUserPosts();
      })
      .catch((err) => {
        this.utilityService.alertMessage('error', 'Unable to delete post');
        this.loading = false;
      });
  }

  openConfirmDeletePopUp(id, template) {
    this.postId = id;
    this.openConfirmModal(template);
  }

  openConfirmCommentDeletePopUp(id, template) {
    this.commentId = id;
    this.openConfirmModal(template);
  }

  confirm(): void {
    this.modalRef.hide();
    if (this.postId) {
      this.deletePost(this.postId);
    }
    if (this.commentId) {
      this.deleteComment(this.commentId);
    }
  }

  decline(): void {
    this.modalRef.hide();
  }

  openConfirmModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'warning_modal',
    });
  }

  toggleAddComment(content) {
    content.expandOne = !content.expandOne;
  }

  toggleListComment(content) {
    content.expandTwo = !content.expandTwo;
  }

  apiPayload(postId) {
    //let formData = new FormData();
    let payload: any = {};
    payload.commentedBy = this.currentUser.id;
    payload.content = this.postCommentForm.value.commentContent;
    payload.postId = postId;

    /* Object.keys(payload).forEach(key=>{
       formData.append(key,payload[key]);
    }); */
    return payload;
  }

  postComment(postId) {
    this.commentSubmitted = true;
    let apiPayloadData = this.apiPayload(postId);

    if (this.postCommentForm.valid) {
      this.loading = true;
      this.userService
        .commentOnPost(apiPayloadData)
        .toPromise()
        .then((res: any) => {
          if (res.success) {
            this.utilityService.alertMessage(
              'success',
              'Comment posted Successfully'
            );
          } else {
            this.utilityService.alertMessage('error', 'Unable to post comment');
          }
          this.loading = false;
          this.commentSubmitted = false;
          this.getUserPosts();
          this.initPostCommentForm();
        })
        .catch((err) => {
          this.utilityService.alertMessage('error', 'Unable to post comment');
          this.loading = false;
          this.commentSubmitted = false;
          this.initPostCommentForm();
        });
    }
  }

  createPostAPIPayload() {
    let formData = new FormData();
    let apiPayload: any = {};

    apiPayload.content = this.createPostForm.value.postContent;
    apiPayload.createdBy = this.currentUser.id;
    apiPayload.isPrivate = false;

    if (this.tagPrivacyForm.value.privacyType === '1' || this.tagPrivacyForm.value.privacyType === 1 )
    {

     if(this.userConnectionList !=null && this.userConnectionList.length>0) {
      apiPayload.isPrivate = true;
        Object.keys(this.userConnectionList).forEach(key=>{
          formData.append('tagUsers',this.userConnectionList[key].userId);
        });
     }
    }

    if ( this.tagPrivacyForm.value.privacyType === '2' || this.tagPrivacyForm.value.privacyType === 2 )
    {
      let selectedConnections = this.tagPrivacyForm.value.selectedConnectionList;
      if (selectedConnections != null && selectedConnections.length > 0) {
        apiPayload.isPrivate = true;
        Object.keys(selectedConnections).forEach((key) => {
          formData.append('tagUsers', selectedConnections[key].userId);
        });
      }
    }

    Object.keys(apiPayload).forEach((key) => {
      formData.append(key, apiPayload[key]);
    });

    if (this.selectedFiles != null && this.selectedFiles.length > 0) {
      Object.keys(this.selectedFiles).forEach((key) => {
        formData.append('files', this.selectedFiles[key].file);
      });
    }
    return formData;
  }

  createPost() {
    let apiFormData = this.createPostAPIPayload();
    this.postSubmitted = true;

    if (this.createPostForm.valid) {
      this.loading = true;
      this.userService
        .createPost(apiFormData)
        .toPromise()
        .then((res: any) => {
          if (res.success) {
            this.utilityService.alertMessage(
              'success',
              'Post created Successfully'
            );
          } else {
            this.utilityService.alertMessage('error', 'Unable to create post');
          }
          this.loading = false;
          this.postSubmitted = false;
          this.resetCreatePostForm();
          this.selectedFiles = [];
          this.getUserPosts();
        })
        .catch((err) => {
          this.utilityService.alertMessage('error', 'Unable to create post');
          this.loading = false;
          this.postSubmitted = false;
          this.resetCreatePostForm();
          this.selectedFiles = [];
        });
    }
  }

  resetCreatePostForm() {
    this.createPostForm.patchValue({ postContent: '' });
  }

  deleteComment(commentId) {
    this.loading = true;
    this.userService
      .deleteComment(commentId)
      .toPromise()
      .then((result: any) => {
        if (result.success) {
          this.utilityService.alertMessage(
            'success',
            'Comment deleted Successfully'
          );
        } else {
          this.utilityService.alertMessage('error', 'Unable to delete comment');
        }
        this.loading = false;
        this.getUserPosts();
      })
      .catch((err) => {
        this.utilityService.alertMessage('error', 'Unable to delete comment');
        this.loading = false;
      });
  }

  /**start image and file related functions */

  handleImageInput(event) {
    this.selectedFiles = [];
    this.exceedNumberOfImages = false;
    this.fileSize = 0;

    if (event.target.files.length > 3) {
      this.exceedNumberOfImages = true;
      //alert("Only 3 image is allowed");
    } else {
      for (var i = 0; i < event.target.files.length; i++) {
        this.selectedFiles.push({
          file: event.target.files[i],
          url: window.URL.createObjectURL(event.target.files[i]),
          fileName: event.target.files[i].name,
          format: 'image',
        });
        this.readURL(this.selectedFiles.length - 1, event.target.files[i]);
        this.fileSize = this.fileSize + event.target.files[i].size;
      }
    }
    event.target.value = '';
  }

  handleVideoInput(event) {
    this.fileSize = 0;
    this.selectedFiles = [];
    for (var i = 0; i < event.target.files.length; i++) {
      this.selectedFiles.push({
        file: event.target.files[i],
        url: window.URL.createObjectURL(event.target.files[i]),
        fileName: event.target.files[i].name,
        format: 'video',
      });

      this.readURL(this.selectedFiles.length - 1, event.target.files[i]);
      this.fileSize = this.fileSize + event.target.files[i].size;
    }
    event.target.value = '';
  }

  handleFileInput(event) {
    this.fileSize = 0;
    this.selectedFiles = [];
    for (var i = 0; i < event.target.files.length; i++) {
      this.selectedFiles.push({
        file: event.target.files[i],
        url: window.URL.createObjectURL(event.target.files[i]),
        fileName: event.target.files[i].name,
        format: 'document',
      });
      this.fileSize = this.fileSize + event.target.files[i].size;
    }
  }

  readURL(index, file) {
    var reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedFiles[index].dataUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  deleteImage(id, fileName) {
    this.selectedFiles.splice(id, 1);
  }

  /**end image and file related functions */

  /**start modal related functions */

  openMediumModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-medium' });
  }

  openLargeModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  openMediaModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'post-media-popup',
    });
  }
  /**end modal related functions */

  addMediaPopUp(template) {
    this.openMediumModal(template);
  }

  openViewProfilePopUp(content, templateProfile) {
    this.userProfileId = content.createdBy;
    this.openLargeModal(templateProfile);
  }

  tagUserPopUp(template) {
    //this.resetTagPrivacyFormForm();
    this.hideConnectionBox = true;
    this.initTagPrivacyForm();
    this.tagPrivacyForm.patchValue({ selectedConnectionList: null });
    this.openMediumModal(template);
  }

  openMediaPopUp(mediaList, template) {
    this.postMediaList = mediaList;
    this.openMediaModal(template);
  }

  /*
  onCheckboxChange(e) {
    if (e.target.checked) {
      this.selectedUser.push(e.target.value);
    } else {
      this.selectedUser.forEach((value) => {
        if (value === e.target.value) {
        let index = this.selectedUser.indexOf(value);
        this.selectedUser.splice(index, 1);
          return;
        }
      });
    }
}*/

  onScroll() {
    this.loading = true;
    if (this.noOfItemsToShowInitially <= this.postList.length) {
      this.noOfItemsToShowInitially += this.itemsToLoad;
      this.itemsToShow = this.postList.slice(0, this.noOfItemsToShowInitially);
      console.log('scrolled');
    } else {
      this.isFullListDisplayed = true;
    }
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}
