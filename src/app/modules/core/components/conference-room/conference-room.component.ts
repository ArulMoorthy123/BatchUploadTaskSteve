import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { ChatService } from '../../mesibo/providers/chat.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from '../../../../shared/services/utility.service';
import { checkInternet } from '../../../../shared/helper/utilityHelper';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { conference } from '../messenger/qb/helpers/qb.model';
import { CONFERENCE_TYPE } from '../messenger/qb/helpers/qb.constant';
import { Person, Session } from '../session/helpers/session.dto';
import { QBMessageService } from '../messenger/qb/services/qbMessage.service';
import { QBCONSTAND, QB_CONNECTION_STATUS } from '../../helpers/app.config';
import { SessionService } from '../session/session.service';
import { AuthService } from 'src/app/modules/users/services/auth.service';
import { SESSION_STATUS } from '../session/helpers/session.constant';
import { MesiboApiService } from '../../mesibo/providers/mesiboApi.service';
import { isArray } from 'ngx-bootstrap/chronos';
import { QBService } from '../messenger/qb/services/qb.service';
import { isEmptyObj } from '../../mesibo/helpers/utilityHelper';
declare const MESIBOCALL_VIDEOSOURCE_SCREEN;
@Component({
  selector: 'cj-conference-room',
  templateUrl: './conference-room.component.html',
  styleUrls: ['./conference-room.component.scss']
})
export class ConferenceRoomComponent implements OnInit, OnDestroy {
  MESIBOCALL_VIDEOSOURCE_SCREEN = MESIBOCALL_VIDEOSOURCE_SCREEN;
  qbEventSubscription: Subscription;
  chatEventSubscription: Subscription;
  chatModal: boolean = false;
  messageList: any;
  selfUser: any;
  user_input: any;
  action;
  allParticipant: any = [];
  notification: any = [' You are Online'];
  eventsCallNotification: any;
  paramsSubscription: Subscription;
  conferenceData: conference;
  showModal: boolean = false;
  @Output() onCloseEvent = new EventEmitter<boolean>();
  expanded_video_selected: boolean = this.ChatService.MAIN_STREAM_SHOW;
  GRID_MODE: boolean = true;
  strip_stream: boolean = false;
  grid_number: number = 1;
  MAIN_STREAM_ID = this.ChatService.MAIN_STREAM_ID;
  SHOW_LOCAL_STREAM: boolean = true;
  show_chat: boolean = false;
  IS_LOCAL_STREAM_SCREEN_SHARE = false;
  constructor(public ChatService: ChatService, private ref: ChangeDetectorRef,
    private router: Router,
    private qbService: QBService,
    private utilityService: UtilityService,
    private auth: AuthService,
    private qbMessage: QBMessageService,
    public bsModalRef: BsModalRef,
    private mesiboApi: MesiboApiService,
    private sessionService: SessionService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.paramsSubscription = this.route.queryParams.subscribe(params => {
      if (params['id']) {
        // this.conferenceData.groupid = params['id'] ? parseInt(params['id']) : null,
        // this.startCall();
      }
    });
    this.qbEventSubscription = this.qbService
      .getObserverEvents()
      .subscribe((message: any) => {
        switch (message.type) {
          case 'SESSION_CALL_END':
            console.log(message, 'confer', this.conferenceData);
            if (this.conferenceData.id == message.data.id) {
              this.endCall();
            }
            break;
        }
      });

    this.chatEventSubscription = this.ChatService.getObserverEvents().subscribe(async (message: any) => {
      switch (message.type) {
        case "ON_PARTICIPANT":
          this.onParticipant(message.data);
          break;

        case "ON_PARTICIPANT_UPDATE":
          this.onParticipantUpdated(message.data);
          break;
        case "ON_STOP_CALL":
          if (this.ChatService.selectedChat.groupid == message.data)
            this.endCall();

          break;
        case "ON_CONNECTED":
          this.onVideoConnected(message.data, message.status);
          break;
        case "ON_LOCAL_MEDIA_UPDATE":

          break;
        case "ON_VIDEO":
          this.onVideo(message.data),
            this.updateLocalStreamUI(message.data);
          //this.ChatService.streamRenterOnMain();
          break;
        case 'ON_MUTE':
          this.ChatService.updateStream(message.data);
          this.updateLocalStreamUI(message.data);
          break;
        case "ON_HANG_UP":
          this.ChatService.on_hangup(message.data, message.status);
          let p =message.data;
          p.isConnected=false;
          this.updateLocalStreamUI(p);
          break;
      }
      console.log(message);
    }); // end obseravalble 


    this.eventsCallNotification = this.ChatService.callNotification.subscribe(res => {
      this.notification.push(res);
    })
    this.messageList = this.ChatService.currentMessageList;
    this.selfUser = this.ChatService.selfUser;
  }

  assignSession(chat: conference, members: Person[] = null) {
    this.conferenceData = chat;
  }

  calcGrid() {
    let total_stream = this.ChatService.streams.length;
    this.SHOW_LOCAL_STREAM ? total_stream + 1 : '';
    // if (total_stream > 9) {
    //   this.grid_number = 4;
    // } else if (total_stream % 3 == 0) {
    //   this.grid_number = 3;
    // } else if(total_stream==1) {
    //   this.grid_number = 1;
    // }else{
    //   this.grid_number =4;
    // }
    this.grid_number = 2;
  }


  onParticipantUpdated(data) {
    let all = data.all, latest = data.latest;
    console.log('Mesibo_OnParticipantsUpdated', latest.getName(), 'talking', latest.isTalking(), latest.muteStatus(false, true), latest.muteStatus(true, true));
    this.ChatService.updateStream(latest),
      this.ChatService.updateParticipant(latest);
    console.log('participant list', this.ChatService.participantList)
  }

  onVideo(p) {
    if (p.isLocal()) {
      p.element_id = 'localVideo';
    }
    console.log(p.getUserData(),'get User Data')
    this.ChatService.connectStream(p, p.element_id);
  }

  onParticipant(data) {
    let p = data.p, joined = data.joined;
    if (!p)
      return;

    if (!joined) {
      this.ChatService.removeParticipant(p);
      console.log(p.getName(), ' has left the call');
      return;
    }
    this.ChatService.subscribeStream(p);
    if (p.isLocal() && p.source == MESIBOCALL_VIDEOSOURCE_SCREEN) {
      this.selectStream(p);
    }
    let ringTone = new Audio("assets/tone/join.mp3");
    ringTone.play();
    //        MesiboLog(getStreamId(p), p.getId(), p.getType(), p.getName() + ' has entered the room <=========');
    if (p.getType && p.getType() > 0)
      this.ChatService.callNotification.emit(p.getAddress() + ' is sharing the screen-' + p.getType());
    else
      this.ChatService.callNotification.emit(p.getAddress() + ' has entered the room');
    console.log('participant list', this.ChatService.participantList);
    this.calcGrid();
  }

  onVideoConnected(p, connected) {
    this.ChatService.onVideoConnected(p, connected);
  }

  checkConnection() {
    if (this.connectionStatus == 'Online') {
      return checkInternet();
    } else {
      return false;
    }
  }

  sendNotification(start = true) {
    if (this.conferenceData.initiator) {
      let messageBody = {
        type: 'chat',
        body: this.conferenceData.title,
        extension: {
          notification_type: start ? QBCONSTAND.NOTIFICATION_TYPES.SESSION_CALL_START : QBCONSTAND.NOTIFICATION_TYPES.SESSION_CALL_END,
          dialog_id: this.conferenceData.id,
          sessionId: this.conferenceData.groupid,
          call_type: this.conferenceData.type
        }
      };
      let userId = [];
      let mem: any = this.conferenceData.members;
      this.ref.detectChanges();
      if (Array.isArray(this.conferenceData.members)) {
        this.conferenceData.members.map(a => userId.push(parseInt(a.qbid)));
      } else {
        userId.push(mem.qbid);
      }
      setTimeout(
        () => { this.qbMessage.sendSystemMessage(userId, messageBody), this.ref.detectChanges(); },
        1000
      );
    }
  }

  sessionStatusUpdate(start = true) {
    let status;
    if (start) {
      status = SESSION_STATUS.STARTED;
    } else {
      status = SESSION_STATUS.FINISHED;
    }
    let formData = new FormData();
    formData.append('id', this.conferenceData.id),
      formData.append('status', status);
    this.sessionService.updateSessions(formData).then(res => {
    }).then((result: any) => {
    }).catch(err => {
      console.log(err, ' error on session add');
    }).finally(() => {
    });
  }

  addMember() {
    this.ChatService.addNewMember(this.conferenceData.groupid, [this.auth.currentUserValue.emailId]).then(res => {
      //this.initialize
    }).catch(err => {
      console.log(err, ' error on adding member');
    })
  }

  getQuickbloxStatus() {
    let status = this.qbService.getConnectionStatus();
    status = status == QB_CONNECTION_STATUS.CONNECTED ? false : true;
    return status;
  }
  startCall() {

    if (!this.connectionStatus) {
      this.utilityService.alertMessage('error', ' please check connection..');
      return false;
    }

    let con = this.ChatService.getConnectionStatus();
    if (!con.status) {
      this.utilityService.alertMessage('error', ' please check connection..');
      this.endCall();
      return false;
    }
    if (this.getQuickbloxStatus()) {
      this.utilityService.alertMessage('error', ' connection not getting established plz wait..');
      this.endCall();
      return false;
    }

    if (!this.ChatService.selectedChat.groupid) {
      this.utilityService.alertMessage('error', ' conference Id not selected..');
      this.endCall();
      return false;
    }
    this.showModal = true;
    this.ref.detectChanges();
    this.joinInitCall();
    if (this.conferenceData.type == CONFERENCE_TYPE.SESSION_CALL && this.conferenceData.initiator) {
      this.sessionStatusUpdate(true);
      this.sendNotification(true);
    } else if (this.conferenceData.type == CONFERENCE_TYPE.SESSION_CALL) {
      this.addMember();
    }
    this.ChatService.getMessage(this.ChatService.selfUser.address, this.conferenceData.groupid, null)
    if (this.action == "START_CALL")
      this.ChatService.sendMessage(this.ChatService.selectedChat.groupid, "ON_CALL", 1),
        this.ref.detectChanges();
    this.GRID_MODE = true;
    this.calcGrid();
  }

  toggeleVideo() {
    if (this.IS_LOCAL_STREAM_SCREEN_SHARE) {
      this.ChatService.streamLocalVideo();
    } else {
      this.ChatService.toggleSelfVideo();
    }
    this.SHOW_LOCAL_STREAM = true;
  }

  sendMsg() {
    if (this.user_input !== '') {
      if (this.ChatService.sendMessage(this.ChatService.selectedChat.groupid, this.user_input))
        this.user_input = "";
      //this.scrollDown();
    }
  }

  endCall() {
    this.ChatService.hangupCall();
    //this.router.navigateByUrl(UrlService.USER_PAGE.DASHBOARD_URL);
    if (this.conferenceData.type == CONFERENCE_TYPE.SESSION_CALL && this.conferenceData.initiator) {
      this.sessionStatusUpdate(false);
      this.sendNotification(false);
    }
    if (this.conferenceData.initiator) {
      this.deleteGroup();
    }
    this.closeVideoModal();
  }

  deleteGroup() {
    this.mesiboApi.deleteGroup(this.conferenceData.groupid).toPromise().then(res => {

    });
  }
  closeVideoModal() {
    this.bsModalRef.hide();
    this.onCloseEvent.emit(true);
  }

  toggleVideo() {
    this.ChatService.streamLocalVideo();
  }

  shareScreen() {
    if (!this.IS_LOCAL_STREAM_SCREEN_SHARE) {
      this.SHOW_LOCAL_STREAM = false;
      this.ChatService.shareYourScreen();
    } else {
      this.ChatService.publisherSession.toggleVideoMute(),
        this.IS_LOCAL_STREAM_SCREEN_SHARE = false;
    }
  }

  async joinInitCall() {
    this.ChatService.initConference(this.ChatService.selfUser, this.ChatService.selectedChat.groupid);
  }

  get connectionStatus() {
    let con = this.ChatService.getConnectionStatus();
    return con;
  }

  getLocalMuteStatus(isAudioOnly=true){
    if(!isEmptyObj(this.ChatService.publisherSession)){
      if(isAudioOnly){
        return this.ChatService.publisherSession.muteStatus() 
      }else {
        return this.ChatService.publisherSession.muteStatus(true,false) 
      }
    }
    return false;
  }

  selectStream(s) {
    this.GRID_MODE = false;
    this.ChatService.streamRenterOnMain(s);
  }

  toggleChat() {
    this.show_chat = !this.show_chat;
  }

  updateLocalStreamUI(p) {
    if (p.isLocal()) {
      if (p.media.video.source == this.MESIBOCALL_VIDEOSOURCE_SCREEN) {
        this.IS_LOCAL_STREAM_SCREEN_SHARE = p.isConnected;
      } else {
        this.IS_LOCAL_STREAM_SCREEN_SHARE = false;
      }
    }
  }

  restoreGrid() {
    this.GRID_MODE = true;
    this.calcGrid();
    this.ChatService.clearMainStream();
  }

  ngOnDestroy(): void {
    this.chatEventSubscription.unsubscribe(),
      this.qbEventSubscription.unsubscribe(),
      this.endCall();
    this.eventsCallNotification.unsubscribe();
    this.paramsSubscription.unsubscribe();
  }
}
