import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { QBService } from './services/qb.service';
import { QBHelperService } from './helpers/qbHelper.service';
import { QBVideoService } from './services/qbVideo.service ';
import { QBDialogueService } from './services/qbDialogue.service';
import { QBMessageService } from './services/qbMessage.service';
import { MODAL_ID, QBCONSTAND, QB_CONNECTION_STATUS } from '../../../helpers/app.config';
import { UsersService } from '../../../../users/services/users.service';
import { AuthService } from '../../../../users/services/auth.service';
import { ChatService } from '../../../mesibo/providers/chat.service';
import { UrlService } from '../../../../../shared/services/url.service';
import { MesiboApiService } from '../../../mesibo/providers/mesiboApi.service';
import { Router } from '@angular/router';
import { isEmptyObj } from '../../../mesibo/helpers/utilityHelper';
import { CoreService } from '../../../services/core.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { APP_QB_EVENT, CONFERENCE_TYPE } from './helpers/qb.constant';
import { PrivateCallComponent } from '../../private-call/private-call.component';
import { ConferenceRoomComponent } from '../../conference-room/conference-room.component';
import { conference } from './helpers/qb.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { take } from 'rxjs/operators';

declare const $: any;
declare var QB: any;

@Component({
  selector: 'messenger-qb',
  templateUrl: './qb.component.html',
  styleUrls: ['./qb.component.scss'],

})
export class QBComponent implements OnInit, OnDestroy {
  qbEventSubscription: Subscription;
  session;
  loader = false;
  videoModal: boolean;
  incomingModal: BsModalRef;
  privateCallModal: BsModalRef;
  conferenceCallModal: BsModalRef;
  incomingSession: any;
  incomingFromText: string;
  incomingMessage: any;
  currentConference: conference = null;
  incomingSessionModal: BsModalRef;
  incomingSessionData: conference;
  //@ViewChild('privateCall', { static: false }) PrivateCallComponent: PrivateCallComponent;
  @ViewChild('incomingTemplate') incomingTemplate;
  @ViewChild('incomingSessionTemplate') incomingSessionTemplate;
  constructor(
    public qbService: QBService,
    public qbdialogue: QBDialogueService,
    private chatService: ChatService,
    private auth: AuthService,
    private router: Router,
    private mesiboApi: MesiboApiService,
    public qbvideo: QBVideoService,
    public qbMessage: QBMessageService,
    public qbHelper: QBHelperService,
    public userService: UsersService,
    public ref: ChangeDetectorRef,
    private coreService: CoreService,
    private utilityService: UtilityService,
    private modelService: BsModalService
  ) { }

  ngOnInit(): void {

    this.loginChatServer();
    this.qbEventSubscription = this.qbService
      .getObserverEvents()
      .subscribe((message: any) => {
        console.log(message, 'Message Events');
        switch (message.type) {

          case 'STARTCALL':
            //this.incomingCallFormOtherDialog(message.data);
            break;
          case 'INCOMING_PRIVATE_CALL':
            this.incomingSession = message.status;
            this.incomingCallFormOtherDialog(message.data);
            break;
          case 'INCOMECALL_CONF':
            this.incomingCallFormOtherDialog(message.data);
            break;
          case 'STOPCALL':
            this.endcall();
            break;
          case 'MAKE_CALL':
            this.call(message.data.dialogueId, message.data.isAduioOnly);
            break;
          case 'LOGGED_IN':
            this.getConnectionList();
            break;

          case APP_QB_EVENT.START_SESSION:
            this.openConferenceModal(message.data);
            break;

          case 'PRIVATE_CALL_CLOSED':
            if (isEmptyObj(this.incomingSession)) {
              this.toggleIncomingModal(false);
            } else {
              if (this.incomingSession.initiatorID) {
                if (this.incomingSession.initiatorID == message.data.initiatorID) {
                  this.toggleIncomingModal(false);
                }
              }
            }
            break;
          case 'UPDATE_USER_DATA':
            this.doLoginQb();
            break;

          case 'SESSION_CALL_START':
            this.incomingSessionCall(message.data);
          break;

            case 'SESSION_CALL_END':
              if(this.incomingSessionData){
                if(this.incomingSessionData.id ==message.data.id){
                  this.toggleIncomingSessionModal();
                }
              }
              break;

          case 'INCOMMING_MESSAGE':
            if (message.data.notification_type) {
              console.log('incoming Message', parseInt(message.data.notification_type))
              if (QBCONSTAND.NOTIFICATION_TYPES.DELETE_GROUP == parseInt(message.data.notification_type)) {
                this.qbMessage.clearDialogueAndMessage(message.data.chat_dialog_id);
                return;
              }
            } else {
              let url = window.location.href;
              console.log(url)
              if (url.includes(UrlService.USER_PAGE.MESSAGE_URL)) {
                if (!isEmptyObj(this.qbdialogue.currentDialogue)) {
                  if (this.qbdialogue.currentDialogue._id == message.data.chat_dialog_id) {
                    return;  // need not play sound
                  }
                }
              }
              this.coreService.ringTonePlay("MESSAGE");
            }
            break;
        }
        this.ref.detectChanges();
        this.session = this.qbService.getSession();
      });

  }


  get_chatconnect() {
    if (this.qbService.getQBStatus() && this.auth.currentUserValue.qbid) {
      this.qbService.chatConnect().then(res => {
        // this.registerListner();
        this.qbdialogue.getDialogs({}),
          this.qbMessage.bindMessageListener();
        this.qbvideo.registerVideoListner();
      }).catch((err) => {
        console.log('Get chats error: ' + err);
      });
    }
  }

  loginChatServer() {
    if (!this.qbService.getQBStatus()) {
      if (this.auth.loginStatus) {
       this.doLoginMesibo(this.auth.currentUserValue.emailId);
       this.doLoginQb();
      }
    }
  }

  doLoginQb() {
    let emailId = this.auth.currentUserValue.emailId;
    if (emailId && this.qbService.getConnectionStatus() !== QB_CONNECTION_STATUS.CONNECTED && this.auth.currentUserValue.qbid) {
      this.qbService.init(),
        console.log('Login...');
      this.qbService.qbCreateConnection(emailId).then(res => {
        QB.service.setSession(JSON.parse(sessionStorage.getItem('session')));
        this.get_chatconnect(),
          console.log('Logged In...');
        this.qbService.setEvent('LOGGED_IN', 'chatConnect', true);
      }).catch(error => {
        console.log(error);
        this.doLoginQb();
      });
    }
  }


  doLoginMesibo(emails) {
    let email = emails.trim();
    if (isEmptyObj(this.chatService.selfUser)) {
      this.mesiboApi.userAdd(email).toPromise().then((res: any) => {
        if (res.result) {
          console.log(res.user.token, ' Mesibo login response');
          this.chatService.init(res.user.token),
          this.chatService.selfUser.address = email;
          this.chatService.selfUser.name = email;
          this.chatService.selfUser.qbid =this.auth.currentUserValue.qbid;
          this.chatService.selfUser.profileImageUrl =this.auth.currentUserValue.profileImageUrl
        }
      }).catch(err => {
        console.log(err, ' Mesibo login failed');
      });
    }
  }

  getConnectionList() {
    this.coreService.getConnectionList();
  }

  async openVideoModal(makeCall = true, isAudioOnly = false, incomingSession = null) {
    const initialState = {
      ignoreBackdropClick: true,
      animated: true,
      keyboard: false,
      class: 'modal-xl',
      id: MODAL_ID.PRIVATE_CALL
    };
    this.privateCallModal = await this.modelService.show(PrivateCallComponent, initialState);
    if (makeCall) {
      this.privateCallModal.content.makeCall(isAudioOnly);
    } else {
      this.privateCallModal.content.acceptCall(incomingSession, isAudioOnly);
    }
  }

  async openConferenceModal(chat: conference) {
    this.chatService.assignSelectChat(chat);
    const initialState = {
      ignoreBackdropClick: true,
      animated: true,
      keyboard: false,
      class: 'modal-xl',
      id: MODAL_ID.CONFERENCE_CALL
    };
    console.log('call session init', chat);
    if (chat.type == CONFERENCE_TYPE.SESSION_CALL && chat.initiator) {
      console.log(chat, 'session')
      if (!chat.members || !chat.groupid) {
        this.utilityService.alertMessage('error', 'there is no Information in  session');
        return;
      }
    }
    this.conferenceCallModal = await this.modelService.show(ConferenceRoomComponent, initialState),
      this.conferenceCallModal.content.assignSession(chat),
      this.conferenceCallModal.content.startCall();
    this.conferenceCallModal.content.onCloseEvent.pipe(take(1)).subscribe(res => {
      if (res == true) {
        this.incomingSession = {};
        this.incomingSessionData = null;
      }
      this.modelService.hide(MODAL_ID.CONFERENCE_CALL);
    });
    this.currentConference = chat;
  }

  closeVideoModal() {
    if (this.privateCallModal) {
      this.modelService.hide(MODAL_ID.PRIVATE_CALL);
      this.privateCallModal = null;
    }
    this.videoModal = false;
  }

  // make a call 
  async call(dialogueId, isAudioOnly = false) {
    this.qbdialogue.setCurrentDialogue(dialogueId);
    if (this.qbdialogue.currentDialogue.type == QBCONSTAND.DIALOG_TYPES.CHAT) {
      this.openVideoModal(true, isAudioOnly),
        this.ref.detectChanges();
    }
    else if (this.qbdialogue.currentDialogue.type == QBCONSTAND.DIALOG_TYPES.GROUPCHAT) {
      // if (this.qbdialogue.currentDialogue.occupants_ids.length > 4) {
      // alert('only u can connect with 4 members');
      return this.makeConfCall(this.qbdialogue.currentDialogue);
      // } else {
      // this.qbvideo.makeCall(this.qbdialogue.currentDialogue, isAudioOnly, parseInt(this.auth.currentUserValue.qbid));
      // }
    }
  }

  checkMesiboGroupId(dialogue) {
    if (!dialogue.data) {
      return false;
    } else if (dialogue.data.mid) {
      return dialogue.data.mid;
    }
    return false;
  }


  //redirect to conference
  async makeConfCall(dialogue) {
    let chat: conference;
    chat.name = this.qbdialogue.currentDialogue.name;
    chat.title = this.qbdialogue.currentDialogue.name;
    chat.type = CONFERENCE_TYPE.GROUP_CALL;
    if (this.checkMesiboGroupId(dialogue)) {
      chat.groupid = dialogue.data.mid;
      await this.chatService.addNewMember(chat.groupid, [this.auth.currentUserValue.emailId]);
    } else {
      await this.chatService.createGroup(this.qbdialogue.currentDialogue.name, [this.auth.currentUserValue.emailId], '').then(res => {
        chat.groupid = res.group.gid;
        this.updateQbDialogue(this.qbdialogue.currentDialogue._id, res.group.gid),
          console.log(res, 'result of group mesibo creation');
      }).catch(err => {
        alert('error on create group');
        console.log(err, 'error on create group')
        return false;
      });
    }
    this.qbHelper.notifyAboutState(QBCONSTAND.NOTIFICATION_TYPES.START_CONF_VIDEO_CALL, chat.groupid, dialogue._id);
    if (chat.groupid) {
      this.openConferenceModal(chat);
    }
  }


  // redirectToConference(chat) {
  //   //this.router.navigate([UrlService.USER_PAGE.CONFERENCE_URL], { queryParams: { id: chat.groupid } })
  // }

  updateQbDialogue(dialog_id, mid) {
    let params: any = {
      data: {
        class_name: 'dialogue_info',
        mid: mid
      }
    }
    this.qbdialogue.updateDialog(dialog_id, params).then(res => {
      let userList = this.qbMessage.getRecipientUserId(this.qbdialogue.currentDialogue.occupants_ids);
      this.qbHelper.notifyAboutState(QBCONSTAND.NOTIFICATION_TYPES.UPDATE_DIALOG, this.qbdialogue.currentDialogue._id, this.qbdialogue.currentDialogue._id);
    });
  }

  incomingCallFormOtherDialog(data) {
    let dialogue = this.qbdialogue.checkDialogueExists(data.dialog_id);
    this.incomingFromText = dialogue.name || 'Unknown';
    this.incomingMessage = data;
    console.log(data, ' message form incoming  ' + data.userId);
    if (data.userId == this.auth.currentUserValue.qbid) {
      return;
    }
    this.ref.detectChanges();
    this.toggleIncomingModal(true);
  }

  incomingSessionCall(data) {
    let chat: conference = {
      id: data.id,
      title: data.title,
      groupid: data.sessionId,
      type: CONFERENCE_TYPE.SESSION_CALL,
      initiator: false
    }
    if (this.incomingMessage) {
      if (this.incomingSessionData.id == chat.id) {
        return;
      }
    }
    this.incomingSessionData = chat;
    this.ref.detectChanges();
    this.toggleIncomingSessionModal(true);
  }

  acceptSession() {
    if (this.incomingSessionData) {
      this.coreService.stopRingTone();
      this.toggleIncomingSessionModal(false);
      this.openConferenceModal(this.incomingSessionData);
    }
  }

  async acceptCall() {
    console.log(this.incomingMessage);
    if (this.incomingMessage) {
      this.toggleIncomingModal(false);
      if (parseInt(this.incomingMessage.notification_type) == QBCONSTAND.NOTIFICATION_TYPES.START_CONF_VIDEO_CALL) {
        let callData: conference;
        callData.groupid = this.incomingMessage.message,
          callData.title = this.qbdialogue.dialogs[this.incomingMessage.dialog_id].name || 'Unknown';
        callData.type = CONFERENCE_TYPE.GROUP_CALL;
        this.openConferenceModal(callData);
      } else {
        this.videoModal = true;
        this.qbdialogue.setCurrentDialogue(this.incomingMessage.dialog_id),
          this.ref.detectChanges();
        if (this.incomingMessage.isAudioOnly == "true") {
          this.incomingMessage.isAudioOnly = true;
        } else {
          this.incomingMessage.isAudioOnly = false;
        }
        console.log(this.incomingMessage, ' before accept call');
        this.openVideoModal(false, this.incomingMessage.isAudioOnly, this.incomingSession);
        //this.PrivateCallComponent.acceptCall(this.incomingSession, this.incomingMessage.isAudioOnly);
        this.coreService.ringTonePlay("JOIN"),
          this.incomingSession = {};
      }
    }
  }

  reject() {
    if (parseInt(this.incomingMessage.notification_type) != QBCONSTAND.NOTIFICATION_TYPES.START_CONF_VIDEO_CALL) {
      this.qbvideo.rejectCall(this.incomingSession);
      this.incomingSession = {};
    }
    this.toggleIncomingModal(false)
  }


  toggleIncomingModal(status = false) {
    if (status) {
      this.incomingModal = this.modelService.show(this.incomingTemplate, { backdrop: 'static', ignoreBackdropClick: true, keyboard: false });
      this.coreService.ringTonePlay("CALL");
    } else {
      console.log(this.incomingModal, 'incomming modal');
      if (this.incomingModal) {
        this.incomingModal.hide();
        this.coreService.stopRingTone();
      }
    }
  }

  toggleIncomingSessionModal(status = false) {
    if (status) {
      this.incomingSessionModal = this.modelService.show(this.incomingSessionTemplate, { backdrop: 'static', ignoreBackdropClick: true, keyboard: false });
      this.coreService.ringTonePlay("CALL");
    } else {
      console.log(this.incomingSessionModal, 'incoming session modal');
      if (this.incomingSessionModal) {
        this.incomingSessionModal.hide();
        this.coreService.stopRingTone();
      }
    }
  }

  endcall() {
    this.closeVideoModal();
    this.qbvideo.stopcall();
  }


  ngOnDestroy() {
    this.qbEventSubscription.unsubscribe();
  }
}
