import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/modules/core/mesibo/providers/chat.service';

@Component({
  selector: 'app-mesibo-messenger',
  templateUrl: './mesibo-messenger.component.html',
  styleUrls: ['./mesibo-messenger.component.scss']
})
export class MesiboMessengerComponent implements OnInit {
  messageData: Array<any> = [];
  messageForm: FormGroup;
  self_address;
  chatProfileModal = false;
  currentGroupId = null;
  chatEventSubscription: Subscription;
  chatOpenStatus:boolean=false;
  @Input() set showChat (status){
    this.chatOpenStatus=status;
    if(status){
      setTimeout(
        () => this.scrollTo(),
        1000
      );
    }
  }

  @Input()
  public set groupId(id: any) {
    if (id) {
      this.messageData = [];
      console.log(this.chatService.selfUser, ' self user');
      this.self_address = this.chatService.selfUser.address;
      this.currentGroupId = id;
      // this.getMessage();
    }
  }
  @ViewChildren("chatDiv") chatDiv: QueryList<ElementRef>;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.messageFormInit(),
      this.chatEventSubscription = this.chatService.getObserverEvents().subscribe(async (message: any) => {
        switch (message.type) {
          case "ON_MESSAGE":
            this.setMessage(message.data);
            //this.messageData.push(message.data);
            break;

          case "MESSAGE_STATUS":
            this.updateMessage(message.data);
            break;

          default:
            break;
        }
        console.log(message,'from mesibo message')
      });
    this.getMessage(true);
  }

  messageFormInit() {
    const nonWhitespaceRegExp: RegExp = new RegExp("\\S");
    this.messageForm = new FormGroup({
      message: new FormControl('', [Validators.required, Validators.pattern(nonWhitespaceRegExp)]),
    });
  }

  setMessage(msg) {
    if (!this.chatService.currentMessageList.hasOwnProperty(this.currentGroupId)) {
      this.chatService.currentMessageList[this.currentGroupId] = [];
    }
    console.log('set message', msg ,this.chatService.currentMessageList)
    this.chatService.currentMessageList[this.currentGroupId].push(msg),
    this.getMessage(true);
  }

  getMessage(scroll = false) {
    this.messageData = [];
    this.messageData = this.chatService.currentMessageList[this.currentGroupId] || [];
   //this.chatService.getMessage(this.self_address, this.groupId, 1000);
    if (scroll) {
      setTimeout(
        () => this.scrollTo(),
        1000
      );
    }
    return this.messageData;
  }

  scrollTo(viewLength = 0) {
    if(!this.chatDiv || !this.messageData.length)
    return;
    console.log(this.chatDiv, 'chat div');
    let ele = this.chatDiv.toArray();
    console.log(ele, 'element chat div');
    if (viewLength) {
      ele[viewLength].nativeElement.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
    } else {
      this.chatDiv.last.nativeElement.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
    }
    console.log('scroll to ' + viewLength)
  }

  sendMessage() {
    if (!this.messageForm.valid) {
      return false;
    }
    console.log('send message called');
   let msg= this.chatService.sendMessage(this.currentGroupId, this.messageForm.value.message.trim(),0,this.self_address);
   //this.messageData.push(msg);
    this.messageForm.patchValue({
      message: '',
    }),

      setTimeout(
        () => this.scrollTo(),
        1000
      );
  }

  updateMessage(msg) {
    console.log(msg, ' update message');
    if (msg.id) {
      if (this.chatService.currentMessageList[this.currentGroupId]) {
        this.chatService.currentMessageList[this.currentGroupId].map(a => {
          if (a.id == msg.id) {
            a.status = msg.status;
          }
        });
        this.getMessage(),
        console.log(this.messageData, 'message data',  this.chatService.currentMessageList);
      }
    }
  }

  ngOnDestroy(): void {
    this.chatEventSubscription.unsubscribe();
    this.messageData=[];
    this.chatService.currentMessageList[this.currentGroupId]={};
  }
}