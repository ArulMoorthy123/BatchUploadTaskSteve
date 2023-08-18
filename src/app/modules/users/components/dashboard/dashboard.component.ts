import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { UrlService } from 'src/app/shared/services/url.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  env = environment;
  urlServices = UrlService;
  modalRef: BsModalRef;

  currentUser: any;
  userGroupList: any = [];
  userConnectionList: any = [];
  loading: boolean;
  userTotalConnection: number = 0;
  userTotalGroup: number = 0;
  userProfileId: any;
  userAllConnectionList: any = [];

  constructor(
    public auth: AuthService,
    private userService: UsersService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('userDetails'));
    //this.getUserGroups();
    this.getUserConnections();
  }

  getUserGroups() {
    this.userService
      .getUserGroups(this.currentUser.id)
      .subscribe((data: any[]) => {
        if (data) {
          this.userTotalGroup = data.length;
          this.userGroupList = data.slice(0, 5);
        }
      });
  }

  getUserConnections() {
    this.userService
      .getConnections(this.currentUser.emailId)
      .subscribe((data: any[]) => {
        if (data) {
          this.userAllConnectionList = data;
          this.userTotalConnection = data.length;
          this.userConnectionList = data.slice(0, 5);
        }
      });
  }

  openLargeModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  openViewProfilePopUp(userId, templateProfile) {
    this.userProfileId = userId;
    this.openLargeModal(templateProfile);
  }

  decline(): void {
    this.modalRef.hide();
  }
}
