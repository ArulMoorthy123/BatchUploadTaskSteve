import { Component, Input, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'user-view-profile',
  templateUrl: './user-view-profile.component.html',
  styleUrls: ['./user-view-profile.component.scss'],
})
export class UserViewProfileComponent implements OnInit {
  currentUser: any;
  userProfileDetails: any;
  loading: boolean = false;
  profileImageUrl = null;

  @Input() userId = null;

  constructor(
    private userService: UsersService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('userDetails'));
    this.getUserProfileDetails();
  }

  getUserProfileDetails() {
    this.loading = true;
    // console.log("user profile id- >",this.userId);
    let profileId = this.userId ? this.userId : this.currentUser.id;
    this.userService
      .getProfile(profileId)
      .toPromise()
      .then((result) => {
        if (result) {
          this.userProfileDetails = result;
          if (this.userProfileDetails.profileImageUrl) {
            this.profileImageUrl =
              environment.apiurl + this.userProfileDetails.profileImageUrl;
          }
        } else {
          this.userProfileDetails = [];
        }
        this.loading = false;
      })
      .catch((err) => {
        this.userProfileDetails = [];
        this.loading = false;
      });
  }
}
