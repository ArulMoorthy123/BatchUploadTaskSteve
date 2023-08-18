import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { AppConstServ } from './../../../shared/helper/app-constant.service';
import { QBService } from './../components/messenger/qb/services/qb.service';
import { QBDialogueService } from './../components/messenger/qb/services/qbDialogue.service';
import { QBMessageService } from './../components/messenger/qb/services/qbMessage.service';
import { QBVideoService } from './../components/messenger/qb/services/qbVideo.service ';

declare var QB: any;
@Injectable({
  providedIn: 'root',
})
export class MessengerService {
  observeQBEvents: any;

  constructor(
    private qbService: QBService,
    private qbdialogue: QBDialogueService,
    private qbMessage: QBMessageService,
    private qbVideo: QBVideoService
  ) {
    this.observeQBEvents = new Subject<any>();
  }
  
  public loginChat(loginData: any = {}) {
    if (AppConstServ.CHAT_PROVIDER == 'QB') {
      this.qbService
        .qbCreateConnection(loginData)
        .then((res) => {
          QB.service.setSession(JSON.parse(sessionStorage.getItem('session'))),
            this.observeQBEvents.next({
              type: 'loggedIn',
              data: res,
              status: true,
            });
          this.connectWithQB();
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.warn('CHAT disabled');
    }
  }

  public connectWithQB() {
    console.log('chat connect...');
    this.qbService
      .chatConnect()
      .then((res) => {
        console.log(res);
        this.qbdialogue.getDialogs({});
        this.qbMessage.bindMessageListener();
        this.qbVideo.registerVideoListner();
        this.qbService.observeQBEvents.next({
          type: 'chatConnected',
          data: res,
          status: false,
        });
      })
      .catch((err) => {
        console.log('Get chats error: ' + err);
      });
  }
}
