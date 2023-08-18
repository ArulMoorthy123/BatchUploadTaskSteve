import { Injectable } from '@angular/core';
declare var QB: any;
import { QBService } from './qb.service';
import { QBDialogueService } from './qbDialogue.service';
import { QBCONSTAND, MESSAGE_LIMIT } from '../../../../helpers/app.config';
import { AuthService } from '../../../../../users/services/auth.service';
@Injectable({
  providedIn: 'root',
})
export class QBMessageService {
  dialogueMessage: any = {};
  constructor(
    private QBService: QBService,
    private dialogService: QBDialogueService,
    private auth: AuthService
  ) { }

  bindMessageListener() {
    QB.chat.onMessageListener = this.onMessageListener.bind(this);
    QB.chat.onDeliveredStatusListener = this.onDeliveredStatusListener.bind(this);
    QB.chat.onSentMessageCallback = this.onSentMessageListener.bind(this);
    QB.chat.onReadStatusListener = this.onReadStatusListener.bind(this);
    QB.chat.onSystemMessageListener = this.onSystemMessageListener.bind(this);
    QB.chat.onKickOccupant = this.onKickOccupant.bind(this);
    QB.chat.onLeaveOccupant = this.onLeaveOccupant.bind(this);
  }

  public getMessage(dialogId, loadMoreSkip = 0) {
    return new Promise((resolve, reject) => {
      if (dialogId == undefined || dialogId == '') {
        resolve({data:[], limitExceed : true});
      }


      let limit = MESSAGE_LIMIT;
      let params: any = {
        chat_dialog_id: dialogId,
        sort_desc: 'date_sent',
        limit: limit,
        mark_as_read: false,
      };

      if (loadMoreSkip) {
        params.skip = loadMoreSkip;
      }
      let limitExceed = false;
      if (dialogId in this.dialogueMessage === false || (loadMoreSkip && dialogId in this.dialogueMessage === true)) {
        QB.chat.message.list(params, (err, resDialogs) => {
          if (err) {
            console.log('Message List error: ', err);
            this.QBService.observeQBEvents.next({
              type: 'messageList',
              data: err,
              status: false,
            });
            reject(err);
          } else {
            if (resDialogs.items.length != limit) {
              limitExceed = true;
            }
            this.setDialogsMessage(resDialogs.items);
            resolve({ data: resDialogs.items.reverse(), limitExceed: limitExceed });
          }
        });
      } else {
        resolve({data:this.dialogueMessage[dialogId], limitExceed : limitExceed});
      }
    });

  }

  public setDialogsMessage(message: any): any {
    if(message.length==0){
      return;
    }
    let key = message[0]!.chat_dialog_id;
    if (key in this.dialogueMessage === false) {
      this.dialogueMessage[key] = message;
    } else {
      if (Array.isArray(this.dialogueMessage[key])) {
        let messageTemp = message.reverse().concat(this.dialogueMessage[key]);
        this.dialogueMessage[key] = messageTemp;
      }
      else {
        this.dialogueMessage[key] = new Array(message);
      }
    }
    this.QBService.observeQBEvents.next({
      type: 'dialogueMessageChange',
      data: Object.values(this.dialogueMessage),
      status: true,
    });
  }


  public sendMessage(dialog, msg) {
    console.log(msg)
    const
      message = JSON.parse(JSON.stringify(msg)),
      jidOrUserId = dialog.xmpp_room_jid || dialog.jidOrUserId || this.getRecipientUserId(dialog.occupants_ids);
    console.log(jidOrUserId, 'send message Id');
    message.id = QB.chat.send(jidOrUserId, msg);
    console.log(message)
    message.extension.dialog_id = dialog._id;
    return message;
  }

  public getRecipientUserId(users) {
    let user_id = this.auth.currentUserValue.qbid;
    let result_user = [];
    result_user = users.filter(a => a !== user_id);
    if (users.length === 2) {
      return result_user[0];
    }
    return result_user;
  }

  public abCreateAndUpload(file): Promise<any> {
    var self = this;
    return new Promise((resolve, reject) => {
      QB.content.createAndUpload(
        {
          public: false,
          file: file,
          name: file.name,
          type: file.type,
          size: file.size,
        },
        function (err, response) {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        }
      );
    });
  }


  public downloadFile(file): Promise<any> {
    return new Promise((resolve, reject) => {
      QB.content.createAndUpload(
        {
          public: false,
          file: file,
          name: file.name,
          type: file.type,
          size: file.size,
        },
        function (err, response) {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  public fillNewMessageParams(userId, msg) {
    const message = {
      _id: msg.id,
      attachments: [],
      created_at: +msg.extension.date_sent || Date.now() / 1000,
      date_sent: +msg.extension.date_sent || Date.now() / 1000,
      delivered_ids: [userId],
      message: msg.body,
      read_ids: [userId],
      sender_id: userId,
      chat_dialog_id: msg.extension.dialog_id,
      status: null,
      selfReaded: userId == this.QBService.qbSession.user_id
      //selfReaded: true,
      //read: 0
    };

    if (msg.extension.attachments) {
      message.attachments = msg.extension.attachments;
    }

    if (msg.extension.notification_type) {
      message['notification_type'] = msg.extension.notification_type;
    }

    if (msg.extension.new_occupants_ids) {
      message['new_occupants_ids'] = msg.extension.new_occupants_ids;
    }
    if (msg.extension.against_user) {
      message['against_user'] = msg.extension.against_user;
    }
    return message;
  }

  getMessageStatus(message) {
    let userId = this.QBService.qbSession.user_id;
    if (message.sender_id !== userId) {
      return undefined;
    }
    const deleveredToOcuupants = message.delivered_ids.some(function (id) {
      return id !== userId;
    }),
      readedByOccupants = message.read_ids.some(function (id) {
        return id !== userId;
      });
    let msgStaus;

    if (message.hasOwnProperty("status")) {
      msgStaus = message.status
    } else {
      msgStaus = true;
    }
    return msgStaus == true ? !deleveredToOcuupants ? 'sent'
      : readedByOccupants
        ? 'read'
        : 'delivered' : msgStaus == false ? 'failed' : 'loading'
  }

  getFileUrl(id) {
    return QB.content.privateUrl(id);
  }



  onSystemMessageListener(messages) {
    console.log(messages, 'System message Listener');
    let message: any = messages;
    for (const [key, value] of Object.entries(message.extension)) {
      message[key] = value
    }
    // Object.entries((message.extension).map(([key, value]) =>));
    delete message.extension;
    if (message.notification_type) {
      console.log(message.notification_type + '  notification type');
      switch (parseInt(message.notification_type)) {
        case QBCONSTAND.NOTIFICATION_TYPES.START_CONF_AUDIO_CALL:
          //this.qbvideo.makeConfCall(false);
          this.QBService.observeQBEvents.next({
            type: 'INCOMECALL',
            data: message,
            status: true,
          });
          break;
        case QBCONSTAND.NOTIFICATION_TYPES.START_CONF_VIDEO_CALL:
          this.QBService.setEvent('INCOMECALL_CONF', message, true);
          break;
        case QBCONSTAND.NOTIFICATION_TYPES.DROP_CONF_CALL:
          //this.qbvideo.leaveConfCall(false,true);
          break;
        case QBCONSTAND.NOTIFICATION_TYPES.NEW_DIALOG || '1':
          this.dialogService.getDialogById(message.dialog_id);
          //.then(res => {
          console.log(message, 'this response get dialogs by id');
          //  this.dialogService.addDialogs(res);
          //});
          break;
        case QBCONSTAND.NOTIFICATION_TYPES.ADD_NEW_USER_DIALOG || '3':
          this.dialogService.getDialogById(message.dialog_id);
          break;

        case QBCONSTAND.NOTIFICATION_TYPES.STOP_CONF_CALL:
          //this.qbvideo.leaveConfCall(true,false);
          break;

        case QBCONSTAND.NOTIFICATION_TYPES.UPDATE_DIALOG:
          this.dialogService.getDialogById(message.dialog_id);
          break;

        case QBCONSTAND.NOTIFICATION_TYPES.DELIVERY_MESSAGE:
          this.setDelivery(message.message_id, message.dialog_id, message.userId);
          break;

        case QBCONSTAND.NOTIFICATION_TYPES.PRIVATE_CALL_RINGING:
          this.QBService.observeQBEvents.next({
            type: 'PRIVATE_CALL_RINGING', data: message.dialog_id, status: true
          });
          break;

          case QBCONSTAND.NOTIFICATION_TYPES.SESSION_CALL_START:
          this.QBService.observeQBEvents.next({
            type: 'SESSION_CALL_START', data: {id: message.dialog_id,title :message.body,sessionId: message.sessionId}, status: true
          });
          break;

          case QBCONSTAND.NOTIFICATION_TYPES.SESSION_CALL_END:
          this.QBService.observeQBEvents.next({
            type: 'SESSION_CALL_END', data: {id: message.dialog_id,title :message.body,sessionId: message.sessionId}, status: true
          });
          break;
      }
    }
  }
  public sendSystemMessage(userIds, systemMessage) {
    userIds.forEach((userId) => {
      console.log(userId + '  user id notified send');
      QB.chat.sendSystemMessage(userId, systemMessage);
    });
  }

  public update_message(id, params): Promise<any> {
    return new Promise((resolve, reject) => {
      QB.chat.message.update(id, params, function (error, response) {
        if (error) {
          reject(error)
        }
        //else {
        resolve(response)
        //}
      });
    });
  }

  public onSentMessageListener(messageLost, messageSent) {
    if (messageLost) {
      console.log(messageLost, 'message lost');
      this.update_message(messageLost._id, { message: messageLost.message }).then(res => {

        this.dialogueMessage[messageLost.extension.dialog_id].map(a => {
          if (a._id == messageLost.id) {
            a.status = true
          }
        });

      }).catch(err => {
        this.dialogueMessage[messageLost.extension.dialog_id].map(a => {
          if (a._id == messageLost.id) {
            a.status = false
          }
        });
      })
      //this.dialogService.setDialogParams(messageLost);
    } else {
      this.dialogueMessage[messageSent.extension.dialog_id].map(
        a => {
          if (a._id == messageSent.id) {
            a.status = true
          }
        });
    }

  }


  sendReadStatus(messageid, dialogueid, userId) {
    let params = {
      messageId: messageid,
      userId: userId,
      dialogId: dialogueid
    };
    QB.chat.sendReadStatus(params);
    //this.dialogService.dialogs[dialogueid].unread_messages_count ?this.dialogService.dialogs[dialogueid].unread_messages_count--:'';
  }

  sendDeliveryStatus(messageid, dialogueid, userId) {
    let params = {
      messageId: messageid,
      userId: userId,
      dialogId: dialogueid
    };
    console.log(params, ' Send delivery status to server');
    this.sendDeliveryReportEvent(messageid, dialogueid, userId),
      QB.chat.sendDeliveredStatus(params);
  }

  // manually notified to user
  sendDeliveryReportEvent(id, dialog_id, userId) {
    let dialogs = this.dialogService.dialogs[dialog_id] || null;
    if (!dialogs) {
      return false;
    }
    let recipientId = this.getRecipientUserId(dialogs.occupants_ids);
    if (!Array.isArray(recipientId)) {
      recipientId = [recipientId];
    }

    let messageBody: any = {
      type:
        dialogs.type === QBCONSTAND.DIALOG_TYPES.CHAT
          ? 'chat'
          : 'groupchat',
      body: '',
      extension: {
        notification_type: QBCONSTAND.NOTIFICATION_TYPES.DELIVERY_MESSAGE,
        dialog_id: dialog_id,
        message_id: id,
        user_id: userId,
      },
    };
    this.sendSystemMessage(recipientId, messageBody);
  }

  markAllRead(dialog_id, user_Id) {
    let userid = user_Id;
    if (this.dialogService.dialogs[dialog_id].unread_messages_count) {
      if (this.dialogueMessage[dialog_id]) {
        let data: any = Object.values(this.dialogueMessage[dialog_id]);
        let res = data.filter(a => {
          if (a.sender_id != userid) {
            if (!a.delivered_ids.includes(userid)) {
              this.sendDeliveryStatus(a._id, dialog_id, userid)
            }
            if (!a.read_ids.includes(userid)) {
              return true;
            }
          }
          return false;
        })
          .map(x => {
            console.log(x, 'read send status');
            this.sendReadStatus(x._id, dialog_id, userid)
            x.read_ids.push(userid)
            this.dialogService.dialogs[dialog_id].unread_messages_count--;
          });
      }
    }

  }

  async onMessageListener(userId, IncomeMessage) {
    console.log(IncomeMessage, 'Incoming message Listener');
    IncomeMessage.extension.date_sent = new Date(+IncomeMessage.extension.date_sent * 1000);
    let message = this.fillNewMessageParams(userId, IncomeMessage);

    if (IncomeMessage.markable) {
      QB.chat.sendDeliveredStatus({
        messageId: message._id,
        userId: userId,
        dialogId: message.chat_dialog_id,
      });
      message.delivered_ids.push[userId];
    }
    console.log(message, '    New listener ');

    //new dialogue update msg and get dialogu info from server
    if (message.chat_dialog_id in this.dialogService.dialogs === false) {
      await this.dialogService.getDialogById(message.chat_dialog_id).then(res => {
        this.dialogueMessage[message.chat_dialog_id] = [],
          this.dialogueMessage[message.chat_dialog_id].push(message);
      });
      return false;
    }

    //check message exists and add new message
    if (this.dialogueMessage.hasOwnProperty(message.chat_dialog_id)) {
      let data = this.dialogueMessage[message.chat_dialog_id].filter(a => a._id == message._id);
      if (!data.length) {
        this.dialogueMessage[message.chat_dialog_id].push(message),
        this.QBService.setEvent('INCOMMING_MESSAGE', message, true);
      } else {
        return false;
      }
    }
    this.dialogService.setDialogParams(message);

  }


  private onReadStatusListener = function (messageId, dialogId, userId) {
    console.log(messageId + 'reads listener');
    if (messageId && dialogId) {
      //if (userId === this.QBService.qbSession.user_id) return false;
      if (this.dialogueMessage[dialogId].length) {
        for (let i = 0; i < this.dialogueMessage[dialogId].length; i++) {
          if (this.dialogueMessage[dialogId][i]._id == messageId) {
            let res = this.dialogueMessage[dialogId][i].read_ids.filter(a => a == userId);
            if (!res.length) {
              this.dialogueMessage[dialogId][i].read_ids.push(userId);
            }
          }
        }
      }
      this.QBService.setEvent('MESSAGE_READ', { messageId: messageId, dialogId: dialogId });
    }
  };

  clearDialogueAndMessage(dialogId) {
    this.dialogService.removeDialog(dialogId);
    this.removeMessage(dialogId);
  }

  onKickOccupant(dialogId, initiUserid) {
    console.log('on onKickOccupant')
    this.clearDialogueAndMessage(dialogId)
  }

  onLeaveOccupant(dialogId, userId) {
    console.log('on onLeaveOccupant', userId)
    //if (userId == parseInt(this.auth.currentUserValue.qbid)) {
    //this.clearDialogueAndMessage(dialogId)
    // }
  }

  removeMessage(dialogId) {
    if (this.dialogueMessage[dialogId]) {
      delete this.dialogueMessage[dialogId];
    }
  }

  private onDeliveredStatusListener = function (messageId, dialogId, userId) {
    console.log('delivery report' + userId);
    var self = this;
    self.setDelivery(messageId, dialogId, userId);
  };


  private setDelivery(messageId, dialogId, userId) {
    if (messageId && dialogId) {
      //if (userId === this.QBService.qbSession.user_id) return false;
      if (this.dialogueMessage[dialogId].length) {
        for (let i = 0; i < this.dialogueMessage[dialogId].length; i++) {
          if (this.dialogueMessage[dialogId][i]._id == messageId) {
            let res = this.dialogueMessage[dialogId][i].delivered_ids.filter(a => a == userId);
            if (!res.length) {
              this.dialogueMessage[dialogId][i].delivered_ids.push(userId);
            }
          }
        }
      }
      this.QBService.setEvent('MESSAGE_DELIVERY', { messageId: messageId, dialogId: dialogId }, true);
    }
  }
}
