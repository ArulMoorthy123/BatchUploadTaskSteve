import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'view-user-post',
  templateUrl: './view-user-post.component.html',
  styleUrls: ['./view-user-post.component.scss']
})
export class ViewUserPostComponent implements OnInit {

  postCommentForm : FormGroup;
  env = environment;
  currentUser:any;
  loading:boolean = false;
  submitted:boolean = false;
  postDetail:any;
  userPostId :any;

  constructor(private userService :UsersService,
              private utilityService :UtilityService,
              private route: ActivatedRoute) {
    }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('userDetails'));
    this.initPostCommentForm();
    this.route.queryParams.subscribe(params => {
      this.userPostId = params['postId'];
      if(this.userPostId){
        this.getPostDetail(this.userPostId);
      }
    });
  }

  initPostCommentForm() {
    this.postCommentForm = new FormGroup({
      commentContent: new FormControl('', [Validators.required ]),
    });
  }

  getPostDetail(postId){
    this.loading = true;
    this.userService.viewPost(postId).toPromise().then((result:any) => {
      if(result) {
        this.postDetail = result;
      }
      else {
        this.postDetail = []
      }
      this.loading = false;
    }).catch(err => {
      this.postDetail = [];
      this.loading = false;
    });
  }

  apiPayload(){
    //let formData = new FormData();
    let payload: any = {};
    payload.commentedBy = this.currentUser.id;
    payload.content = this.postCommentForm.value.commentContent;
    payload.postId =  this.userPostId;

   /* Object.keys(payload).forEach(key=>{
       formData.append(key,payload[key]);
    }); */
    return payload;
  }

  postComment(){
    this.submitted = true;
    let apiPayloadData = this.apiPayload();
    if(this.postCommentForm.valid){
      this.loading = true;
      this.userService.commentOnPost(apiPayloadData).toPromise().then((res:any) => {
        if(res.success) {
          this.utilityService.alertMessage('success','Comment posted Successfully');
        }
        else {
          this.utilityService.alertMessage('error','Unable to post comment');
        }
        this.loading = false;
        this.submitted = false;
        this.getPostDetail(this.userPostId);
        this.initPostCommentForm();
      }).catch(err => {
        this.utilityService.alertMessage('error','Unable to post comment');
        this.loading = false;
        this.submitted = false;
        this.getPostDetail(this.userPostId);
        this.initPostCommentForm();
      });
      }
  }

}
