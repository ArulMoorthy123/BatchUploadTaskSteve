import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UrlService } from 'src/app/shared/services/url.service';
import { Location } from '@angular/common';
import { SessionAddComponent } from './session-add/session-add.component';
import { SessionDetailsComponent } from './session-details/session-details.component';
import { MODAL_ID } from '../../helpers/app.config';
import { AuthService } from 'src/app/modules/users/services/auth.service';
import { take } from 'rxjs/operators';
import { SessionService } from './session.service';
import { Session } from './helpers/session.dto';
import { SESSION_MESSAGES, SESSION_LIST, SESSION_STATUS } from './helpers/session.constant';
//import { sortBy } from './helpers/';
import { sessionHelper, sortBy } from './helpers';
import { Subscription } from 'rxjs';
import { QBService } from '../messenger/qb/services/qb.service';
@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
})
export class SessionComponent implements OnInit, OnDestroy {
  createModal: BsModalRef;
  viewModal: BsModalRef;
  sessionId = null;
  allSessions: Session[];
  sessionList: any = [];
  connectionList;
  currentUser = this.auth.getUserDetails();
  loading: boolean = false;
  qbEventSubscription: Subscription;
  @ViewChild('viewSessionTemplate') viewSessionTemplate;
  MESSAGES = SESSION_MESSAGES;
  SESSION_LIST = SESSION_LIST;
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private modalService: BsModalService,
    private auth: AuthService,
    private qbService: QBService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.auth.getUserDetails();
    this.getSessionAll();
    this.qbEventSubscription = this.qbService
      .getObserverEvents()
      .subscribe((message: any) => {
        switch (message.type) {
          case 'SESSION_CALL_START':
            this.updateSessionList(message.data, true);
            break;
          case 'SESSION_CALL_END':
            this.updateSessionList(message.data);
            break;
        }
      });

  }

  updateSessionList(data, start = false) {
    let status = start ? SESSION_STATUS.STARTED : SESSION_STATUS.FINISHED;
    let id = typeof data.id == 'string' ? parseInt(data.id) : data.id;
    if (this.allSessions.length) {
      this.allSessions.map(a => {
        if (a.id == id) {
          a.uri = data.sessionId;
          a.status = status;
        }
      });
      this.sessionList=[];
      this.sessionList = sessionHelper.formatData(this.allSessions);
    }
  }
  ngAfterViewInit() {
    let id = this.route.snapshot.paramMap.get('sessionId') || '';
    id && this.viewSession(id);
  }

  viewSession(id) {
    this.location.go(
      `${UrlService.USER_PAGE.SESSION_URL.split(/[/]+/).pop()}/${id}`
    );
    const initialState = {
      ignoreBackdropClick: true,
      animated: true,
      keyboard: false,
      class: 'modal-xl',
      id: MODAL_ID.VIEW_SESSION,
      sessionId: id,
    };
    this.sessionId = id;
    this.viewModal = this.modalService.show(
      SessionDetailsComponent,
      initialState
    );
  }

  closeModal() {
    this.location.go(UrlService.USER_PAGE.SESSION_URL.split(/[/]+/).pop());
    this.createModal && this.createModal.hide();
    this.viewModal && this.modalService.hide(MODAL_ID.VIEW_SESSION);
  }

  createSession(id = null) {
    console.log(id);
    this.createModal = this.modalService.show(SessionAddComponent, {
      class: 'modal-md',
    });
    this.createModal.content.onCloseEvent.pipe(take(1)).subscribe((res) => {
      if (res == true) {
        this.getSessionAll();
      }
    });
    this.createModal.content.assignSessionId(id);
    this.createModal.content.getSessionById(id);
  }

  async getSessionAll() {
    this.loading = true;
    await this.sessionService
      .getSessions(this.auth.currentUserValue.id)
      .then((res: any) => {
        if (res.error) {
          this.sessionList = [];
        } else {
          this.allSessions = res;
          this.sessionList = sessionHelper.formatData(res);
          SESSION_LIST.forEach((list) => {
            sortBy(this.sessionList[list]);
          });

        }
        this.loading = false
        return true;
      })
      .catch((err) => {
        console.log(err, 'error on get All session');
        this.loading = false;
      });
  }

  ngOnDestroy() {
    this.qbEventSubscription.unsubscribe();
  }
}
