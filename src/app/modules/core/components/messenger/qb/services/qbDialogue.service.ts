import { Injectable, ChangeDetectorRef } from '@angular/core';
declare var QB: any;
import { QBService } from './qb.service';
import { QBCONSTAND } from '../../../../helpers/app.config';
@Injectable({
  providedIn: 'root',
})
export class QBDialogueService {
  constructor(private QBService: QBService) { }
  currentDialogue: any;
  dialogs: any = {};

  public getDialogs(args) {
    let filter = {
      limit: 100,
      sort_desc: 'updated_at',
    };
    filter['type[in]'] = [3, 2, 1].join(',');
    if (args) filter = args;

    QB.chat.dialog.list(filter, (err, resDialogs) => {
      if (err) {
        this.QBService.observeQBEvents.next({
          type: 'dialogueGet',
          data: err,
          status: false,
        });
      } else {
        if (resDialogs) {
          resDialogs['items'].forEach(async (chat, index, self) => {
            if (chat.xmpp_room_jid && chat.type != 3) {
              await this.joinToDialog(chat).then((res: any) => {
                console.log(res, ' reuslt of join dialogue');
              });
            }
          });
          this.dialogs = resDialogs;
          this.setDialogs(resDialogs['items']);
        }
        console.log('Dialog List: ', resDialogs);
      }
    });
  }

  public setCurrentDialogue(id) {
    this.currentDialogue = this.dialogs[id]?this.dialogs[id]: null;
  }

  public setDialogs(chats): any {
    this.dialogs = chats.reduce((obj, item) => {
      obj[item._id] = item;
      return obj;
    }, {});
    console.log(this.dialogs);
    this.QBService.observeQBEvents.next({
      type: 'dialogueListChange',
      data: Object.values(this.dialogs),
      status: true,
    });
  }

  public addDialogs(chat) {
    if (chat) {
      let temObj = {};
      temObj[chat._id] = chat;
      if (this.dialogs[chat._id]) delete this.dialogs[chat._id];
      this.dialogs = Object.assign(temObj, this.dialogs);
      this.QBService.observeQBEvents.next({
        type: 'dialogueListChange',
        data: Object.values(this.dialogs),
        status: true,
      });
    }
  }

  getDialogById(id) {
    var self = this;
    return new Promise(function (resolve, reject) {
      QB.chat.dialog.list({ _id: id }, function (err, res) {
        if (err) {
          console.error(err);
          reject(err)
        }
        const dialog = res.items[0];
        if (dialog) {
          console.log(res.items[0], 'get dialogue by id');
          self.addDialogs(res.items[0]);
          res['items'].forEach(async (chat, index, selfData) => {
            if (chat.xmpp_room_jid) {
              await self.joinToDialog(chat).then((res: any) => {
                console.log(res, ' result of join dialogue');
              });
            }
          });
          resolve(res);
        }
      });
    });
  }

  public setDialogParams(message) {
    const tmpObj = {};
    tmpObj[message.chat_dialog_id] = this.dialogs[message.chat_dialog_id];
    tmpObj[message.chat_dialog_id].last_message = message.message;
    tmpObj[message.chat_dialog_id].last_message_date_sent = message.date_sent;
    tmpObj[message.chat_dialog_id].last_message_id = message._id;
    tmpObj[message.chat_dialog_id].last_message_user_id = message.sender_id;
    if (!message.selfReaded) {
      tmpObj[message.chat_dialog_id].unread_messages_count++;
    }
    if (this.dialogs[message.chat_dialog_id]) {
      delete this.dialogs[message.chat_dialog_id];
    }
    this.dialogs = Object.assign(tmpObj, this.dialogs);
    this.QBService.setEvent('dialogueListChange', Object.values(this.dialogs), true);
  }

  checkDialogueExists(id) {
    if (this.dialogs[id]) {
      return this.dialogs[id];
    } else {
      return false;
    }
  }

  removeDialog(chat_dialog_id) {
    if (this.dialogs[chat_dialog_id]) {
      delete this.dialogs[chat_dialog_id];
      console.log('remove dialogue', chat_dialog_id);
      this.QBService.setEvent('dialogueListChange', Object.values(this.dialogs), true);
    }
  }

  public joinToDialog(dialog): Promise<any> {
    return new Promise((resolve, reject) => {
      const
        jidOrUserId = dialog.xmpp_room_jid || dialog.jidOrUserId;
      QB.chat.muc.join(jidOrUserId, function (resultStanza) {
        for (let i = 0; i < resultStanza.childNodes.length; i++) {
          const elItem = resultStanza.childNodes.item(i);
          if (elItem.tagName === 'error') {
            return reject();
          }
        }
        resolve(true);
      });
    });
  }

  public createDialog(params): Promise<any> {
    var self = this;
    return new Promise((resolve, reject) => {
      QB.chat.dialog.create(params, async function (createErr, createRes) {
        if (createErr) {
          console.log('Dialog creation Error : ', createErr);
          reject(createErr);
        } else {
          self.addDialogs(createRes);
          if (createRes.type != QBCONSTAND.DIALOG_TYPES.CHAT) {
            await self.joinToDialog(createRes).then((res: any) => {
              console.log(res, ' result of join dialogue');
            });
          }
          console.log(createRes, 'before resolve');
          resolve(createRes);
          console.log(createRes, 'after resolve');
        }
      });
    });
  }

  public updateDialog(dialogueID, params, updateList = true): Promise<any> {
    var self = this;
    return new Promise((resolve, reject) => {
      QB.chat.dialog.update(dialogueID, params, async function (error, createRes) {
        if (error) {
          console.log('Dialog update Error : ', error);
          reject(error);
        } else {
          console.log('Dialog Update successfully', createRes);
          if (updateList) {
            await self.getDialogById(dialogueID);
          }
          resolve(createRes);
        }
      });
    });
  }

  public deleteDialog(dialogueID, isAdmin: boolean = false): Promise<any> {
    var self = this;
    let params: any = {};
    if (isAdmin) {
      params.force = 1;
    }
    return new Promise((resolve, reject) => {
      QB.chat.dialog.delete([dialogueID], params, function (error, createRes) {
        if (error) {
          reject(error);
        } else {
          self.removeDialog(dialogueID),
          resolve(createRes);
        }
      });
    });
  }

}
