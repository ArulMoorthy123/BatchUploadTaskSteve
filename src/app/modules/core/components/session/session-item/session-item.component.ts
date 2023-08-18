import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Session } from '../helpers/session.dto';
import { conference } from '../../messenger/qb/helpers/qb.model';
import {
  SESSION_FILTER,
  SESSION_STATUS,
  SESSION_LIST,
} from './../helpers/session.constant';
import {
  APP_QB_EVENT,
  CONFERENCE_TYPE,
} from '../../messenger/qb/helpers/qb.constant';
import { QBService } from '../../messenger/qb/services/qb.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmBoxComponent } from 'src/app/shared/components/confirm-box/confirm-box.component';
import { SessionService } from '../session.service';
import * as moment from 'moment';
import { ChatService } from '../../../mesibo/providers/chat.service';
import { getTimeZoneToLocal } from 'src/app/shared/helper/timezone-utility';
@Component({
  selector: 'app-session-item',
  templateUrl: './session-item.component.html',
  styleUrls: ['./session-item.component.scss'],
})
export class SessionItemComponent implements OnInit {
  private modalRef: BsModalRef;
  @ViewChild('sessionLoadingTemplate') sessionLoadingTemplate;
  sessionLoadingModal: BsModalRef;
  sessionDetail: Session;
  @Input() public set sessionData(s: Session) {
    this.sessionDetail = s;
    this.mapWithConference(s);
    this.showButton();
  }
  @Input() currentUser;
  @Input() sessionGroup;
  @Output() onEditSession = new EventEmitter<string>();
  @Output() refreshList = new EventEmitter<boolean>();
  onDeleteLoader = false;
  loading = false;
  fullDetails;

  filters = SESSION_FILTER;
  status = SESSION_STATUS;
  SESSION_LIST = SESSION_LIST;
  ACTIVE = 'ACTIVE';

  isOwner = false;
  callDisabled = true;

  callText = 'Join Now';
  statusText;
  confDetails: conference = {
    groupid: '',
    type: '',
    name: '',
    title: '',
    members: [],
  };

  constructor(
    private qbService: QBService,
    private sessionService: SessionService,
    private chatService: ChatService,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    if (this.sessionDetail?.status) {
      this.mapWithConference(this.sessionDetail), this.showButton();
    }
  }

  log(e) {
    console.log(e);
  }

  ngOnChanges(changes: SimpleChanges) {
    /* console.log('changes are made',this.sessionDetail); */
  }

  getTimeDiff() {
    return getTimeZoneToLocal(this.sessionDetail.starts, this.sessionDetail.timeZone, 'LLL');

  }

  showButton() {
    this.isOwner = this.sessionDetail.created_by.id === this.currentUser.id;
    this.callText = this.isOwner ? 'Start Session' : 'Join Now';
    if (this.sessionDetail.status == SESSION_STATUS.STARTED || this.isOwner) {
      this.callDisabled = false;
    }
  }


  async makeACall() {
    //if (this.sessionDetail.status == this.status.WILL_START || this.sessionDetail.status == this.status.STARTED) {
    if (this.sessionDetail.status && this.sessionDetail.created_by.id === this.currentUser.id) {
      //start call
      this.confDetails.initiator = true;
      //if(!this.sessionDetail.uri){
      await this.saveUpdateSession(this.sessionDetail);
      //}
    } else {
      // join call
      this.confDetails.initiator = false;
    }
    // make a call
    this.callSession();
    //}
  }

  mapWithConference(sessionDetail: Session) {
    /* console.log(sessionDetail, ' session details'); */
    if (sessionDetail.uri)
      this.confDetails.groupid = sessionDetail.uri;
    this.confDetails.host = sessionDetail.created_by.name;
    this.confDetails.hostUserId = sessionDetail.created_by.userId;
    this.confDetails.name = sessionDetail.title;
    this.confDetails.title = sessionDetail.title;
    this.confDetails.description = sessionDetail.desc;
    this.confDetails.type = CONFERENCE_TYPE.SESSION_CALL;
    this.confDetails.callStatus = sessionDetail.status;
    this.confDetails.initiator = false;
    this.confDetails.members = sessionDetail.members;
    this.confDetails.id = sessionDetail.id;
  }

  //get and update session groupid
  async saveUpdateSession(sessionDetail: Session) {
    console.log('save session call');
    let members = [];
    //this.sessionDetail.members.map(a=> member.push(a.e));
    members.push(this.currentUser.emailId);
    //member.map(a => members.push(a.email));
    this.loading = true;
    this.sessionLoadingModal = this.modalService.show(
      this.sessionLoadingTemplate,
      { backdrop: 'static', ignoreBackdropClick: true, keyboard: false }
    );
    await this.chatService
      .createGroup(sessionDetail.title, members, '')
      .then((res) => {
        this.confDetails.groupid = res.group.gid;
        this.sessionDetail.uri = res.group.gid;
        let formData = new FormData();
        formData.append('id', sessionDetail.id),
          formData.append('mesiboId', res.group.gid);
        formData.append('uri', res.group.gid);
        return this.sessionService.updateSessions(formData);
      })
      .then((result: any) => {
        this.loading = false;
      })
      .catch((err) => {
        console.log(err, ' error on session add');
        this.loading = false;
        this.sessionLoadingModal.hide();
      })
      .finally(() => {
        this.sessionLoadingModal.hide(), (this.loading = false);
      });
  }

  callSession() {
    console.log('call session');
    this.qbService.setEvent(APP_QB_EVENT.START_SESSION, this.confDetails, true);
  }

  async getSessionData(forceReload = false) {
    if (!this.fullDetails?.id || forceReload) {
      await this.sessionService
        .getSessionById(this.sessionDetail.id)
        .then((res: any) => {
          if (res) {
            this.fullDetails = res[0];
            this.confDetails.members = res[0].members.filter(
              (a) => a.id != this.currentUser.id
            );
          }
        })
        .catch((error) => {
          this.fullDetails;
        });
    }
    return this.fullDetails;
  }

  async deleteSession() {
    if (this.sessionDetail.id) {
      const result = await this.openConfirmDialog();
      if (result) {
        this.deleteSessionFromServer();
      }
    }
  }

  deleteSessionFromServer() {
    this.onDeleteLoader = true;
    this.sessionService
      .deleteSession(this.sessionDetail.id)
      .then((res: any) => {
        if (res.success) {
          this.refreshList.emit(true);
        }
        this.onDeleteLoader = false;
      })
      .catch((err) => {
        this.onDeleteLoader = false;
        console.log(err, ' error on session deletion ');
      });
  }

  openConfirmDialog(
    title = null,
    message = null,
    btnCancel = null,
    btnOK = null
  ): Promise<boolean> {
    const initialState = {
      animated: true,
      message: message,
      title: title,
      btnCancel: btnCancel,
      btnOK: btnOK,
    };
    this.modalRef = this.modalService.show(ConfirmBoxComponent, initialState);
    return new Promise<boolean>((resolve, reject) =>
      this.modalRef.content.onClose.subscribe((result) => resolve(result))
    );
  }

  editSession() {
    //console.log('viewTask: PlanItemComponent', id);
    this.onEditSession.emit(this.sessionDetail.id);
  }
}

/*
Show date & time
Show Created by

Show Invitee List

Share current user from main comp
sort listing

make archive & delete list
  show only for owner

  delete button
  edit button
    if owner && not archive
*/
