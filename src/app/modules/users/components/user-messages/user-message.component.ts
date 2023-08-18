import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { QBService } from '../../../core/components/messenger/qb/services/qb.service';
import { QBDialogueService } from '../../../core/components/messenger/qb/services/qbDialogue.service';
import { QBMessageService } from '../../../core/components/messenger/qb/services/qbMessage.service';


@Component({
  selector: 'user-message',
  templateUrl: './user-message.component.html',
  styleUrls: ['./user-message.component.scss']
})

export class UserMessageComponent implements OnInit {
  qbEventSubscription: Subscription;
  contacts: any;
  chatData: Array<any>;
  message: String;
  selectedUser: any;
  session: any;
  currentDialog: any = false;
  userDetails: any;
  messageObj: any;
  Videosession: any;
  calling: any = false;
  bgSound: any;
  makeCall = false;
  acceptcaller = false;

  dialogueList: any = [];

  attachments: any = [];
  newGroupForm: FormGroup;
  showProfile = false;
  constructor(
    //private qbApiService: QBApiService,
    public qbService: QBService,
    public qbmessage: QBMessageService,
    public qbdialogue: QBDialogueService) { }

  ngOnInit(): void {
    this.formgroupInit();
    this.qbEventSubscription = this.qbService.getObserverEvents().subscribe((message: any) => {
      console.log(message, 'message From Event');
      switch (message.type) {
        case "dialogueListChange":
          this.dialogueList = message.data;
          break;
        case "currentMessageChanges":
          if (message.data.length)
            this.chatData.push(...message.data);
          break
        default:
          break
      }
    });
  }

  formgroupInit() {
    this.newGroupForm = new FormGroup({
      'search': new FormControl(null),
      'groupname': new FormControl(null, [Validators.required]),
      'contactlist': new FormArray([])
    });

  }

  onEnter(dialogue, message) {
    this.sendMessage(message)
    this.message = '';

  }

  sendMessage(body, attachments: any = false) {
    const
      msg = {
        type: this.qbdialogue.currentDialogue.type === 3 ? 'chat' : 'groupchat',
        body: body,
        extension: {
          save_to_history: 1,
          dialog_id: this.qbdialogue.currentDialogue._id
        },
        markable: 1
      };
    if (attachments) {
      msg.extension['attachments'] = attachments;
    }
    const
      message = this.qbmessage.sendMessage(this.qbdialogue.currentDialogue, msg),
      newMessage = this.qbmessage.fillNewMessageParams(this.qbService.qbSession.user_id, message);
    this.qbdialogue.setDialogParams(newMessage);
    this.chatData.push(newMessage);
  }


}
