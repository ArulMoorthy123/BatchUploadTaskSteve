import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef, HostListener, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { QBService } from '../messenger/qb/services/qb.service';
import { QBDialogueService } from '../messenger/qb/services/qbDialogue.service';
import { QBHelperService } from '../messenger/qb/helpers/qbHelper.service';
import { QBVideoService } from '../messenger/qb/services/qbVideo.service ';
import { QBMessageService } from '../messenger/qb/services/qbMessage.service';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators, SelectMultipleControlValueAccessor } from '@angular/forms';
import { QBCONSTAND, MESSAGE_LIMIT } from '../../helpers/app.config';
import { AuthService } from '../../../users/services/auth.service';
import { qbMessage } from '../messenger/qb/helpers/DTO/qb.message.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UtilityService } from '../../../../shared/services/utility.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-message-containner',
  templateUrl: './message-containner.component.html',
  styleUrls: ['./message-containner.component.scss'],

})
export class MessageContainnerComponent implements OnInit, OnDestroy {
  messageForm: FormGroup;
  qbEventSubscription: Subscription;
  currentDialogueId: string;
  messageData: any = [];
  currentDialogue: any = {};
  self_qbid: any = null;
  self_profile;
  attachments: any = [];
  chatProfileModal: boolean = false;

  groupModal: boolean = false;

  groupForm: FormGroup;
  contacts: any = [];
  loader: boolean = false;
  imgModal: BsModalRef;
  modal_image_url;
  uploadingStatus: boolean = false;
  limitExceed: boolean = false;
  show_call_btn=true;
  @ViewChildren("chatDiv") chatDiv: QueryList<ElementRef>;
  @Input()
  public set dialogueId(dialogueId: any) {
    if (dialogueId) {
      this.messageData = [];
      this.self_qbid = this.auth.currentUserValue.qbid;
      this.self_profile = this.auth.currentUserValue.profileImageUrl;
      this.currentDialogueId = dialogueId;
      this.setDialogue(dialogueId),
        this.getMessage();
    }
  }
  
  @Input() 
  public set showCall(show_call_config) {
    this.show_call_btn=show_call_config;
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(evt: KeyboardEvent) {
    // close profile info
    this.toggleChatProfileModal(true);
  }

  constructor(public qbService: QBService,
    public qbdialogue: QBDialogueService,
    private qbHelper: QBHelperService,
    public qbvideo: QBVideoService,
    public auth: AuthService,
    private utilityService: UtilityService,
    private ref: ChangeDetectorRef,
    private modalService: BsModalService,
    public qbMessage: QBMessageService) { }

  ngOnInit(): void {
    this.initVariable(),
      this.messageFormInit(),
      this.qbEventSubscription = this.qbService
        .getObserverEvents()
        .subscribe((message: any) => {
          switch (message.type) {
            case 'dialogueListChange':
              if (this.currentDialogueId) {
                this.setDialogue(this.currentDialogueId); // update changes
              }
              break;
            case 'INCOMMING_MESSAGE':
              this.updateReadStatus(message.data);
              break;
            case 'MESSAGE_DELIVERY':
              this.getMessage();
              break;

            case 'MESSAGE_READ':
              this.getMessage();
              break;

          }
        });
    if (this.auth.currentUserValue) {
      this.self_qbid = this.auth.currentUserValue.qbid || null;
      this.self_profile = this.auth.currentUserValue.profileImageUrl || null;
    }
  }

  notificationMessage(msg: qbMessage) {
    let messageData = '';
    if (msg.notification_type) {
      let notify = parseInt(msg.notification_type);

      switch (notify) {
        case QBCONSTAND.NOTIFICATION_TYPES.NEW_DIALOG:
          messageData = 'Group created by ' + this.getProfileName(msg.sender_id);
          break;

        case QBCONSTAND.NOTIFICATION_TYPES.LEAVE_DIALOG:
          messageData = this.getProfileName(msg.sender_id) + ' left';
          break;

        case QBCONSTAND.NOTIFICATION_TYPES.REMOVE_DIALOG_BY_SOMEONE:
          messageData = 'Removed ' + this.getAgainstUserDetails(msg.against_user) + ' by ' + this.getProfileName(msg.sender_id);
          break;

        case QBCONSTAND.NOTIFICATION_TYPES.ADD_NEW_USER_DIALOG:
          messageData = 'Added ' + this.getAgainstUserDetails(msg.against_user) + ' by ' + this.getProfileName(msg.sender_id);
          break;
      }
    }
    return messageData;
  }

  getAgainstUserDetails(user) {
    let memberName = '';
    var self = this;
    if (user) {
      let member = user.split(',');
      if (member.length) {
        member = member.map(async a => await self.getProfileName(parseInt(a))).join(',');
      }
    }
    return memberName;
  }

  toggleChatProfileModal(status) {
    this.chatProfileModal = !status;
  }


  setDialogue(dialogueId) {
    this.currentDialogue = this.qbdialogue.dialogs[dialogueId] ? this.qbdialogue.dialogs[dialogueId] : null;
    if (this.currentDialogue == null) {
      this.currentDialogueId = null;
    }
  }

  sendMessage() {
    if (!this.messageForm.valid) {
      return false;
    }
    this.qbHelper.sendMessage(this.messageForm.value.message.trim(), this.currentDialogueId),
    this.messageForm.patchValue({
      message: '',
    }),
    
    setTimeout(
      () => this.scrollTo(),
      1000
    ); 
  }

  prepareToUpload(e) {
    let files: any = e.currentTarget.files,
      dialogId: any = this.qbdialogue.currentDialogue._id;
    for (let i = 0; i < files.length; i++) {
      this.uploadFilesAndGetIds(files[i], dialogId);
    }
    e.currentTarget.value = null;
  }

  uploadFilesAndGetIds(file, dialogId) {
    //let allowedExtensions =  /(\.doc|\.docx|\.odt|\.pdf|\.tex|\.txt|\.rtf|\.wps|\.wks|\.wpd|\.jpg|\.jpeg|\.png|\.gif)$/i;

    let file_type = file.type.split('/') || ['application'];
    switch (file_type[0]) {
      case 'image':
        if (file.size >= QBCONSTAND.ATTACHMENT.MAXSIZE) {
          this.utilityService.alertMessage('warning', QBCONSTAND.ATTACHMENT.MAXSIZEMESSAGE);
          return;
        }
        break;
      case "audio":
        if (file.size >= QBCONSTAND.ATTACHMENT.MAX_AUDIO_SIZE) {
          this.utilityService.alertMessage('warning', QBCONSTAND.ATTACHMENT.MAX_AUDIO_SIZE_MESSAGE);
          return;
        }
        break;
      case "video":
        if (file.size >= QBCONSTAND.ATTACHMENT.MAX_VIDEO_SIZE) {
          this.utilityService.alertMessage('warning', QBCONSTAND.ATTACHMENT.MAX_VIDEO_SIZE_MESSAGE);
          return;
        }
        break;
      default:
        if (file.size >= QBCONSTAND.ATTACHMENT.MAX_FILE_SIZE) {
          this.utilityService.alertMessage('warning', QBCONSTAND.ATTACHMENT.MAX_FILE_SIZE_MESSAGE);
          return;
        }
        break;
    }
    // return false;
    this.attachments = [
      {
        id: 'isLoading',
        src: URL.createObjectURL(file),
      },
    ];
    this.uploadingStatus = true;
    this.qbMessage
      .abCreateAndUpload(file)
      .then((response) => {
        this.attachments = [];
        const attachments = [
          { id: response.uid, type: file.type, name: file.name, size: file.size },
        ];
        this.uploadingStatus = false;
        this.qbHelper.sendMessage(
          QBCONSTAND.ATTACHMENT.BODY,
          dialogId,
          attachments
        );
      })
      .catch((err) => {
        this.attachments = [];
        alert('ERROR: ' + err.detail);
        this.uploadingStatus = false;
      });
  }

  getMessage(skipMessage = 0) {
    if (skipMessage == 0) {
      this.limitExceed = false;
    }
    this.loader = true;
    this.qbMessage.getMessage(this.currentDialogueId, skipMessage).then((res: msgResponse) => {
      if (res.hasOwnProperty('limitExceed')) {
        this.limitExceed = res.limitExceed;
      }
      this.messageData = this.qbMessage.dialogueMessage[this.currentDialogueId],
        this.qbMessage.markAllRead(this.currentDialogueId, this.auth.currentUserValue.qbid);
      this.ref.markForCheck();
      this.loader = false;
      this.ref.detectChanges();
      let viewLength = 0;
      if (skipMessage == 0) {
        if (this.qbdialogue.dialogs[this.currentDialogueId].unread_messages_count) {
          viewLength = this.qbdialogue.dialogs[this.currentDialogueId].unread_messages_count - this.messageData.length;
        }
      } else {
        viewLength = this.messageData.length >= MESSAGE_LIMIT ? MESSAGE_LIMIT : this.messageData.length;
      }
      if(res.data.length) { // check message get from remote or add new message
        this.scrollTo(viewLength);
      }
    });
  }

  scrollTo(viewLength = 0) {
    let ele = this.chatDiv.toArray();
    if (viewLength) {
      ele[viewLength].nativeElement.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
    } else {
      this.chatDiv.last.nativeElement.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
    }
    console.log('scroll to '+ viewLength)
  }

  loadMessage() {
    if (this.limitExceed == false) {
      this.getMessage(this.messageData.length);
    }
  }

  async getFileUrl(id) {
    return await this.qbMessage.getFileUrl(id);
  }

  async downloadImage(id, name) {
    let fileUrl = await this.qbMessage.getFileUrl(id);
    this.qbHelper.downloadFile(fileUrl, name).subscribe(res => {
      console.log(res);
    });
    // download({name, urfileUrll}: {name: string, url: string}) {
    //   this.download$ = this.downloads.download(url, name)
    // }
  }
  getProfileUrl(qbid) {
    return this.qbService.getProfileImage(qbid);
  }

  getProfileName(qbid) {
    return this.qbService.getConnectionUserName(qbid);
  }

  //new Call Make
  call(isAduioOnly = false) {
    if (!this.currentDialogueId) {
      return;
    }
    let params = {
      isAduioOnly: isAduioOnly,
      dialogueId: this.currentDialogue._id
    };
    this.qbService.setEvent('MAKE_CALL', params, true);
  }



  addNewMember() {
    this.qbService.setEvent('OPEN_ADD_NEW_MEMBER_MODAL', this.currentDialogueId, true);
  }


  getGroupMember() {
    return this.currentDialogue.occupants_ids.filter(a => a != this.auth.currentUserValue.qbid);
  }

  async updateReadStatus(message) {
    if (this.currentDialogue._id == message.chat_dialog_id) {
      this.qbMessage.markAllRead(message.chat_dialog_id, this.auth.currentUserValue.qbid),
      setTimeout(
        () => this.scrollTo(),
        1000
      ); 
    }
  }

  initVariable() {
    this.messageData = [];
    this.self_qbid = null;
    this.attachments = [];
    this.modal_image_url = null;
  }

  messageFormInit() {
    const nonWhitespaceRegExp: RegExp = new RegExp("\\S");
    this.messageForm = new FormGroup({
      message: new FormControl('', [Validators.required, Validators.pattern(nonWhitespaceRegExp)]),
    });
  }

  clearDialogue(status = false) {
    if (status) {
      this.currentDialogue = {};
      this.currentDialogueId = null;
    }
  }

  openModal(template, id) {
    this.modal_image_url = this.qbMessage.getFileUrl(id),
      this.imgModal = this.modalService.show(template, { id: 123, class: 'mediaImg' });
  }

  closeImgModal() {
    if (this.imgModal) {
      this.modalService.hide(123);
      this.imgModal=null;
    }
  }
  ngOnDestroy(): void {
    this.qbEventSubscription.unsubscribe();
    this.initVariable();
    this.messageFormInit();
  }
}

export class msgResponse {
  data? : [];
  limitExceed? : boolean;
}