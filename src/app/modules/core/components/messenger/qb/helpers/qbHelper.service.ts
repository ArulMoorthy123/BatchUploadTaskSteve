import { Injectable, Inject } from '@angular/core';
import { QBService } from '../services/qb.service';
import { QBMessageService } from '../services/qbMessage.service';
import { QBDialogueService } from '../services/qbDialogue.service';
import { QBCONSTAND } from '../../../../helpers/app.config';
import { map, catchError } from 'rxjs/operators';
import { AppConstServ } from '../../../../../../shared/helper/app-constant.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SAVER, Saver } from '../../../../helpers/download/saver.provider';
import { Download, download } from '../../../../helpers/download/download';
declare var QB: any;
@Injectable({
  providedIn: 'root',
})
export class QBHelperService {
  qbSession: any;
  observeQBEvents: any;
  constructor(
    @Inject(SAVER) private save: Saver,
    private http: HttpClient,
    private qbService: QBService,
    private qbmessage: QBMessageService,
    public qbdialogue: QBDialogueService
  ) { }


  getSrcFromAttachmentId(id) {
    return QB.content.publicUrl(id) + '.json?token=' + this.qbService.qbSession.token;
  }

  public sendMessage(
    body,
    dialogId: any,
    attachments: any = false,
    notification: any = false,
    against_userId: any = []
  ) {
    let dialogue = this.qbdialogue.checkDialogueExists(dialogId);
    
    if(!dialogue) {
      return false;
    }

    const msg = {
      type:
        dialogue.type === QBCONSTAND.DIALOG_TYPES.CHAT ? 'chat' : 'groupchat',
      body: body,
      extension: {
        save_to_history: 1,
        dialog_id: dialogId,
      },
      markable: true,
    };
    if (attachments) {
      msg.extension['attachments'] = attachments;
    }

    if (against_userId.length) {
      let action_to = '';
      if (against_userId.length) {
        action_to = against_userId.join(',');
      }
      msg.extension['against_user'] = action_to;
    }

    if (notification) {
      msg.extension['notification_type'] = notification;
    }

    const message = this.qbmessage.sendMessage(
      dialogue,
      msg
    ),
      newMessage = this.qbmessage.fillNewMessageParams(
        this.qbService.qbSession.user_id,
        message
      );
    console.log(newMessage, ' new Message');
    this.qbdialogue.setDialogParams(newMessage);
    //check message object exists
    console.log('diloogue i d' + dialogId);
    if (!this.qbmessage.dialogueMessage.hasOwnProperty(dialogId)) {
      this.qbmessage.dialogueMessage[dialogId] = [];
    }
    this.qbmessage.dialogueMessage[dialogId].push(newMessage);
  }

  notifyAboutState(type, body = null, dialog_id) {
    console.log('notification system');
    let dialogs = this.qbdialogue.checkDialogueExists(dialog_id);
    if (!dialogs) {
      return false;
    }
    let userId = dialogs.occupants_ids;
    let messageBody: any = {
      type:
        dialogs.type === QBCONSTAND.DIALOG_TYPES.CHAT
          ? 'chat'
          : 'groupchat',
      body: body,
      extension: {
        notification_type: Number(type),
        dialog_id: dialogs._id,
        //user_id: this.qbService.qbSession.user_id,
      },
    };
    this.qbmessage.sendSystemMessage(userId, messageBody);
  }


  public downloadUrl(url: string, fileName: string = null) {
    QB.data.downloadFile
  }

  getDialogueImage(dialogue) {
    if (dialogue.type == QBCONSTAND.DIALOG_TYPES.CHAT) {
      let userId = this.qbmessage.getRecipientUserId(dialogue.occupants_ids);
      return this.qbService.getProfileImage(userId);
    } else if (dialogue.photo) {
      return this.qbmessage.getFileUrl(dialogue.photo);
    } else {
      return AppConstServ.DEFAULT_GROUP_IMAGE_URL;
    }
  }


  downloadFile(url: string, filename?: string): Observable<Download> {
    return this.http.get(url, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
      headers: { Anonymous: 'undefined' } 
    }).pipe(download(blob => this.save(blob, filename)))
  }

  

  blob(url: string, filename?: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob'
    })
  }


  // this.http.get(urlImage, { responseType: 'blob' }).subscribe(val => {
  //   console.log(val);
  //   const url = URL.createObjectURL(val);
  //   downloadUrl(url, 'image.png');
  //   URL.revokeObjectURL(url);
  // });


  public deleteFileById(id): Promise<any> {
    return new Promise((resolve, reject) => {
      QB.content.delete(id, function (err, response) {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

 
  public getRecipientUserId(users) {
    let user_id = this.qbService.qbSession.user_id;
    if (users.length === 2) {
      return users.filter(function (user) {
        if (user !== user_id) {
          return user;
        }
      });
    }
  }
}

