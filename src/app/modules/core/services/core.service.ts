import { Injectable } from '@angular/core';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from '../../users/services/auth.service';
import { QBService } from '../components/messenger/qb/services/qb.service';
import { isEmptyObj } from '../mesibo/helpers/utilityHelper';
@Injectable({
  providedIn: 'root',
})
export class CoreService {
  tone: any;
  ringTone;
  timerIntervaleBeeb: any;
  connectingRingTone = new Audio("assets/tone/beeb.mp3");
  callRingTone = new Audio("assets/tone/ringtone.mp3");
  

  constructor(private userService: UsersService,
    private auth: AuthService,
    private qbService: QBService) {
      this.callRingTone.loop=true;
      this.connectingRingTone.volume=0.3;
      this.connectingRingTone.loop=true;
     }

  setMentors() {
    return false;
  }

  getConnectionList(): Promise<any> {
    let email = this.auth.currentUserValue;
    var self = this;
    //if (email.emailId && !Object.values(this.qbService.contactList).length) {
    return new Promise(function (resolve, reject) {
      self.userService.getChatConnectionList(email.emailId).toPromise().then(async (res: any) => {
        if (!res) {
          reject(false);
        }
        if (res.error) {
          console.log('connection list throw error ', res.error)
          reject(false);
        }
        for (let data of res) {
          if (!data.qbid) {
            let name = data.firstName + ' ' + data.lastName;
            data.qbid = await self.registerQuickblox(data.email, name);
          }
        }
        await self.qbService.setContactList(res);
        resolve(true);
      });
    });
  }

  registerQuickblox(email, name): any {

    this.qbService.getUser({ login: email }).then(async res => {
      if (res.id) {
        await this.updateQid(email, res.id)
        return res.id;
      }
    }).catch(async error => {
      let params = {
        login: email,
        full_name: name,
        email: email
      }
      await this.qbService.registerUser(params).then(res => {
        if (res.id) {
          this.updateQid(email, res.id);
          return res.id;
        }
      });
    });
  }

  updateQid(email, id) {
    if (!email)
      return;
    this.userService.updateQbid(email, id).toPromise().then((res: any) => {
    });
  }

  
  stopRingTone(type = 'RING') {
    switch (type) {
      case 'CONNECTING':
        this.connectingRingTone.pause();
        break;

      case "RING":
        this.connectingRingTone.pause();
        this.callRingTone.pause();
        break;
    }

  }

  ringTonePlay(action) {
    switch (action) {
      case "CALL":
        this.callRingTone.load();
        this.callRingTone.play();
        this.connectingRingTone.pause();
        break;

      case 'CONNECTING':
        this.connectingRingTone.load();
        this.connectingRingTone.play();
        break;
      case "JOIN":
        this.ringTone = new Audio("assets/tone/join.mp3");
        this.ringTone.play();
        break;

      case "MESSAGE":
        this.ringTone = new Audio("assets/tone/chat.mp3");
        this.ringTone.play();
        break;

      default:
        break;
    }
  }

}
