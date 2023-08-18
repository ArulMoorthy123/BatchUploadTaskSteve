import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { SearchFilterPipe } from '../../helpers/search-filter-pipe';
import { environment } from 'src/environments/environment';
import { cleanForm } from '../../../../shared/helper/utilityHelper';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { UrlService } from '../../../../shared/services/url.service';

const INVITATIONS = {
  REQUEST: 'REQUEST',
  SENT: 'SENT',
  ACCEPT: 'ACCEPT',
  CONNECTION: 'CONNECTION'
}

const SHOW_EMAIL = true;

@Component({
  selector: 'user-connection',
  templateUrl: './user-connection.component.html',
  styleUrls: ['./user-connection.component.scss'],
})
export class UserConnectionComponent implements OnInit {
  connectionSearchSortForm: FormGroup;
  inviteForm: FormGroup;
  searchConnectionForm: FormGroup;
  sendMessageForm: FormGroup;
  modalRef: BsModalRef;
  urlServices = UrlService;
  INVITATIONS = INVITATIONS;
  SHOW_EMAIL = SHOW_EMAIL;

  // activeTab: string = 'ADDNEW';
  contentArray: any;
  returnedArray: any;
  currentUser: any;
  userProfile: any;

  searchText: string;
  filteredArray: any;
  env = environment;
  recommendedUsers: any;
  receivedInvitedUsers: any;
  sentInvitedUsers: any;
  submitted: boolean = false;
  loading: boolean = false;
  clickedFromConnection: boolean = false;

  eventTypeCall: string;
  otherUserEmail: string;
  currentPage: number = 1;

  constructor(
    public auth: AuthService,
    private userService: UsersService,
    private searchPipe: SearchFilterPipe,
    private cdr: ChangeDetectorRef,
    private utilityService: UtilityService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('userDetails'));
    this.initForm();
    this.initInviteForm();
    this.initSearchConnectionForm();
    //this.initSendMessageForm();
    this.getUserConnections();
    this.getRecommendedUser();
    this.getAllReceivedInvites();
    this.getAllSentInvites();
    //this.activeTab = 'ADDNEW';
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: 2,
      class: 'warning_modal',
    });
  }

  openLargeModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-dialog' });
  }

  closeModal(modalId?: number) {
    this.modalService.hide(modalId);
  }
/* 
  changeTab(name) {
    this.activeTab = name;
  } */

  initForm() {
    this.connectionSearchSortForm = new FormGroup({
      searchText: new FormControl(null),
      filterDropdown: new FormControl('RA'),
    });

    this.connectionSearchSortForm
      .get('filterDropdown')
      .valueChanges.subscribe((value) => {
        this.sortConnection(value);
      });

    this.connectionSearchSortForm
      .get('searchText')
      .valueChanges.subscribe((value) => {
        this.searchContent(value);
      });
  }
  /* 
  initSendMessageForm() {
    this.sendMessageForm = new FormGroup({
      receiverEmail: new FormControl(''),
      messageContent: new FormControl('', [Validators.required]),
    });
  } 
  */

  sortConnection(sortType) {
    if (sortType == 'RA') {
      /*this.filteredArray = this.filteredArray.sort(function(a, b) {
          let dateA = new Date(a.connectionDate);
          let dateB = new Date(b.connectionDate);
          return Math.abs(dateA.getTime() - dateB.getTime());
      }); */
      this.getUserConnections();
    }
    if (sortType == 'Name') {
      this.filteredArray = this.filteredArray.sort(function (a, b) {
        let fa = a.firstName.toLowerCase();
        let fb = b.firstName.toLowerCase();
        if (fa < fb) {
          return -1;
        }
        if (fa > fb) {
          return 1;
        }
        return 0;
      });
    }
    if (sortType != 'All') {
      this.cdr.detectChanges();
      this.returnedArray = this.filteredArray.slice(0, 5);
    }
    this.currentPage = 1;
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.returnedArray = this.contentArray.slice(startItem, endItem);
  }

  getUserConnections() {
    this.loading = true;
    this.userService
      .getConnections(this.currentUser.emailId)
      .toPromise()
      .then((result) => {
        if (result) {
          this.contentArray = result;
          this.searchContent('');
        } else {
          this.contentArray = [];
          this.searchContent('');
        }
        this.loading = false;
      })
      .catch((err) => {
        this.contentArray = [];
        this.searchContent('');
        this.loading = false;
      });
  }

  searchContent(searchText) {
    this.filteredArray = this.searchPipe.transform(
      this.contentArray,
      searchText
    );
    this.cdr.detectChanges();
    this.returnedArray = this.filteredArray.slice(0, 5);
  }
/* 
  sendMessagePopUp(receiverEmail, template) {
    this.sendMessageForm.patchValue({ receiverEmail: receiverEmail });
    this.sendMessageForm.patchValue({ messageContent: '' });
    this.openLargeModal(template);
  }

  sendMessage() {
    this.submitted = true;
    let formData = new FormData();
    let apiPayload: any = {};
    apiPayload.from = this.currentUser.emailId;
    apiPayload.to = this.sendMessageForm.value.receiverEmail;
    apiPayload.strMessage = this.sendMessageForm.value.messageContent;

    Object.keys(apiPayload).forEach((key) => {
      formData.append(key, apiPayload[key]);
    });

    if (this.sendMessageForm.valid) {
      this.modalRef.hide();
      this.loading = true;
      this.userService
        .sendMessage(formData)
        .toPromise()
        .then((res: any) => {
          if (res) {
            this.utilityService.alertMessage(
              'success',
              'Message sent Successfully'
            );
          } else {
            this.utilityService.alertMessage('error', 'Unable to sent message');
          }
          this.loading = false;
          this.submitted = false;
        })
        .catch((err) => {
          this.utilityService.alertMessage('error', 'Unable to sent message');
          this.loading = false;
          this.submitted = false;
        });
    }
  } */

  /** start recommended user section   */

  getRecommendedUser() {
    this.recommendedUsers = [];
    /* this.userService
      .getAllRecommendations(this.currentUser.emailId)
      .toPromise()
      .then((result) => {
        if (result) {
          this.recommendedUsers = result;
        } else {
          this.recommendedUsers = [];
        }
      })
      .catch((err) => {
        this.recommendedUsers = [];
      }); */
  }

  initSearchConnectionForm() {
    this.searchConnectionForm = new FormGroup({
      searchConnectionString: new FormControl(null),
    });
    this.searchConnectionForm
      .get('searchConnectionString')
      .valueChanges.subscribe((value) => {
        console.log('searchConnectionString-> ', value);
        if (value.length > 3) {
          this.searchConnections(value);
        }
        if (value == null || value == '') {
          this.getRecommendedUser();
        }
      });
  }

  searchConnections(searchString) {
    this.userService
      .getSearchConnection(this.currentUser.emailId, searchString)
      .toPromise()
      .then((result) => {
        if (result) {
          this.recommendedUsers = result;
        } else {
          this.recommendedUsers = [];
        }
      })
      .catch((err) => {
        this.recommendedUsers = [];
      });
  }

  connectToUser(connectToEmail) {
    this.loading = true;
    this.userService
      .connectToUser(this.currentUser.emailId, connectToEmail)
      .toPromise()
      .then((result) => {
        if (result) {
          this.utilityService.alertMessage(
            'success',
            'Connection request sent Successfully'
          );
        } else {
          this.utilityService.alertMessage(
            'error',
            'Unable to sent connection request'
          );
        }
        this.getRecommendedUser();
        this.getAllSentInvites();
        this.loading = false;
      })
      .catch((err) => {
        this.utilityService.alertMessage(
          'error',
          'Unable to sent connection request'
        );
        this.loading = false;
      });
  }

  deleteUserConnection(deleteToEmail) {
    this.closeModal();
    this.loading = true;
    this.userService
      .deleteConnection(this.currentUser.emailId, deleteToEmail)
      .toPromise()
      .then((res: any) => {
        if (res) {
          this.utilityService.alertMessage(
            'success',
            'Connection deleted Successfully'
          );
        } else {
          this.utilityService.alertMessage(
            'error',
            'Unable to delete connection'
          );
        }
        this.getUserConnections();
        this.loading = false;
      })
      .catch((err) => {
        this.utilityService.alertMessage(
          'error',
          'Unable to delete connection'
        );
        this.loading = false;
      });
  }

  openViewProfilePopUp(profile, templateProfile, clickFlag) {
    this.clickedFromConnection = clickFlag;
    this.userProfile = profile;
    this.openProfileModal(templateProfile);
  }

  openProfileModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: 'modal-lg',
    });
  }

  /** end recommended user section   */

  /** start received user invite section   */

  getAllReceivedInvites() {
    this.userService
      .getAllReceivedInvites(this.currentUser.emailId)
      .toPromise()
      .then((result) => {
        if (result) {
          this.receivedInvitedUsers = result;
        } else {
          this.receivedInvitedUsers = [];
        }
      })
      .catch((err) => {
        this.receivedInvitedUsers = [];
      });
  }

  confirmUserRequest(confirmUserEmail) {
    if (confirmUserEmail != null && confirmUserEmail != '') {
      this.loading = true;
      this.userService
        .confirmConnectionRequest(this.currentUser.emailId, confirmUserEmail)
        .toPromise()
        .then((res: any) => {
          if (res.emailSent) {
            this.utilityService.alertMessage(
              'success',
              'Connection request accepted Successfully'
            );
          } else {
            this.utilityService.alertMessage(
              'error',
              'Unable to accepted connection request'
            );
          }
          this.getUserConnections();
          this.getAllReceivedInvites();
          this.loading = false;
        })
        .catch((err) => {
          this.utilityService.alertMessage(
            'error',
            'Unable to accepted connection request'
          );
          this.loading = false;
        });
    } else {
      this.utilityService.alertMessage(
        'error',
        'User email not found to accept connection request'
      );
    }
  }

  ignoreUserRequest(confirmUserEmail) {
    if (confirmUserEmail != null && confirmUserEmail != '') {
      this.loading = true;
      this.userService
        .ignoreConnectionRequest(this.currentUser.emailId, confirmUserEmail)
        .toPromise()
        .then((res: any) => {
          if (res.emailSent) {
            this.utilityService.alertMessage(
              'success',
              'Connection request ignored Successfully'
            );
          } else {
            this.utilityService.alertMessage(
              'error',
              'Unable to ignore connection request'
            );
          }
          this.getAllReceivedInvites();
          this.loading = false;
        })
        .catch((err) => {
          this.utilityService.alertMessage(
            'error',
            'Unable to ignore connection request'
          );
          this.loading = false;
        });
    } else {
      this.utilityService.alertMessage(
        'error',
        'User email not found to ignore connection request'
      );
    }
  }

  /** end received user invite section   */

  /** start common function */

  openModalPopUp(otherEmail, eventType, templateConfirmInvite) {
    this.eventTypeCall = eventType;
    this.otherUserEmail = otherEmail;
    this.openModal(templateConfirmInvite);
  }

  confirm(): void {
    this.modalRef.hide();
    if (this.eventTypeCall === 'connectUser') {
      this.connectToUser(this.otherUserEmail);
    }
    if (this.eventTypeCall === 'deleteConnection') {
      this.deleteUserConnection(this.otherUserEmail);
    }
    if (this.eventTypeCall === 'confirmRequest') {
      this.confirmUserRequest(this.otherUserEmail);
    }
    if (this.eventTypeCall === 'declineRequest') {
      this.declineUserRequest(this.otherUserEmail);
    }
    if (this.eventTypeCall === 'ignoreRequest') {
      this.ignoreUserRequest(this.otherUserEmail);
    }
  }

  decline(): void {
    this.modalRef.hide();
  }

  /** end common function */

  /** start sent  user invite section   */

  getAllSentInvites() {
    this.userService
      .getAllSentInvites(this.currentUser.emailId)
      .toPromise()
      .then((result) => {
        if (result) {
          this.sentInvitedUsers = result;
        } else {
          this.sentInvitedUsers = [];
        }
      })
      .catch((err) => {
        this.sentInvitedUsers = [];
      });
  }

  declineUserRequestPopUp(declineUserEmail, eventType, templateConfirmInvite) {
    this.eventTypeCall = eventType;
    this.otherUserEmail = declineUserEmail;
    this.openModal(templateConfirmInvite);
  }

  declineUserRequest(confirmUserEmail) {
    if (confirmUserEmail != null && confirmUserEmail != '') {
      this.loading = true;
      this.userService
        .declineConnectionRequest(this.currentUser.emailId, confirmUserEmail)
        .toPromise()
        .then((res: any) => {
          if (res.emailSent) {
            this.utilityService.alertMessage(
              'success',
              'Connection request declined Successfully'
            );
          } else {
            this.utilityService.alertMessage(
              'error',
              'Unable to decline connection request'
            );
          }
          this.getAllSentInvites();
          this.getRecommendedUser();
          this.loading = false;
        })
        .catch((err) => {
          this.utilityService.alertMessage(
            'error',
            'Unable to decline connection request'
          );
          this.loading = false;
        });
    } else {
      this.utilityService.alertMessage(
        'error',
        'User email not found to decline connection request'
      );
    }
  }

  /** end  sent user invite section   */

  /** start inivite user realated section  */

  initInviteForm() {
    this.inviteForm = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
      ]),
    });
  }

  inviteApiPayload() {
    let apiPayload: any = {};
    cleanForm(this.inviteForm),
      (apiPayload.email = this.inviteForm.value.email);
    apiPayload.currentUserId = this.currentUser.id;
    return apiPayload;
  }

  inviteUser() {
    this.submitted = true;
    if (this.inviteForm.valid) {
      this.loading = true;
      this.userService
        .inviteUser(
          this.inviteApiPayload().email,
          this.inviteApiPayload().currentUserId
        )
        .toPromise()
        .then((res: any) => {
          if (res.error) {
            this.utilityService.alertMessage(
              'warning',
              res.error,
              'Invitation Failed'
            );
          } else {
            this.utilityService.alertMessage(
              'success',
              'Invitation sent Successfully'
            );
          }
          this.loading = false;
          this.submitted = false;
          this.initInviteForm();
        })
        .catch((error) => {
          this.loading = false;
          this.utilityService.alertMessage('error', 'Invitation sent Failed');
          this.submitted = false;
        });
    }
  }

  handleKeyPress(evn) {
    if (evn.keyCode == 13) {
      this.inviteUser();
    }
  }

  /** end inivite user realated section  */
}
