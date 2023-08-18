import { Injectable } from '@angular/core';
import { MESSAGE_TYEPE } from '../helpers/chat-constant';
declare const MESIBO_FLAG_DEFAULT: any;
declare const MESIBO_FLAG_DELIVERYRECEIPT, MESIBO_FLAG_READRECEIPT, MESIBO_FLAG_TRANSIENT, MESIBO_FLAG_EOR, MESIBO_ORIGIN_REALTIME;
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  currentMessageList: any = {};
  messageSession: any = {}
  appSession: any;
  readCount: number = 1000;
  msg_read_limit_reached = false;
  constructor() { }

  setMessageSession(peer, groupid = 0, name = null) {
    this.msg_read_limit_reached = false;
    var scope = this;
    this.messageSession = this.appSession.readDbSession(peer, groupid, name, function on_read(count) {
      console.log("Read " + count + " number of messages");
      console.log("==> on_read messageSession", count);

      // if(count == undefined || count == null || count == NaN)
      //   return;
      scope.syncMessages(scope, scope.readCount - count, 1);

      // if(this.readCount && count < this.readCount){
      //   console.log("Run out of messages to display. Syncing..");
      //   this.msg_read_limit_reached = true;
      //   return;
      // }

      //       var messages = messageSession.getMessages();
    });

    this.messageSession.read(1000),
      this.messageSession.enableReadReceipt(true);
  }

  on_read(result) {

    // result will be equal to the number of messages read
    console.log("==> on_read messageSession", result);

    if (result == undefined || result == null || result == NaN)
      return;

    if (this.readCount && result < this.readCount) {
      console.log("Run out of messages to display. Syncing..");
      this.msg_read_limit_reached = true;
      this.syncMessages(this, this.readCount - result, 1);
      return;
    }
  }

  syncMessages(readSession, count, type) {
    if (!(readSession && count && readSession.sync)) {
      console.log("syncMessages", "Invalid Input", readSession, count);
      return;
    }

    console.log("syncMessages called \n", readSession, count);

    readSession.sync(count,
      function on_sync(i) {
        console.log("on_sync", i);
        if (i > 0) {
          console.log("Attempting to read " + i + " messages");
          var rCount = this.read(i);
          console.log("Read " + rCount + " messages");
          if (type && rCount)
            this.msg_read_limit_reached = false;
        }
      });
  }


  async getMessage(peer, groupid: any = 0, name = null) {
    let address = groupid || peer;
    await this.setMessageSession(peer, groupid, name),
      //this.currentMessageList[address] = this.messageSession.getMessages();
    console.log(this.messageSession.getMessages(), ' get List of message');
  }

  sendMessage(groupid, msg, type = 0,peer='') {
    let messageParams: any = this.prepareMessageParam(groupid, msg, type,peer);
    this.appSession.sendMessage(messageParams, messageParams.id, messageParams.message);
    if (!this.currentMessageList.hasOwnProperty(groupid)) {
      this.currentMessageList[groupid] = [];
    }
    this.currentMessageList[groupid].push(messageParams);
    return messageParams;
  }

  deleteMessage() {
    let messageParams: any = {}
    messageParams.groupid = 114344;
    this.appSession.deleteMessages(messageParams);
  }

  prepareMessageParam(groupid, value, type,peer='') {
    let messageParams: any = {}
    messageParams.id = this.appSession.random();
    let flag;
    if (type == 1) {
      flag = (MESIBO_FLAG_TRANSIENT | MESIBO_FLAG_EOR);
      messageParams.expiry = 5; // seconds
    } else {
      flag = MESIBO_FLAG_DEFAULT;
    }
    messageParams.peer = peer;
    //if (groupid == 0)
    messageParams.groupid = groupid;
    messageParams.flag = flag;
    messageParams.message = value;
    messageParams.status = 0;
    messageParams.origin = MESIBO_ORIGIN_REALTIME;
    return messageParams;
  }
}
