import { Pipe, PipeTransform } from '@angular/core';
import { isEmptyObj } from '../mesibo/helpers/utilityHelper';
import { QBCONSTAND } from './app.config';
import { QBService } from '../components/messenger/qb/services/qb.service';
import { qbMessage } from '../components/messenger/qb/helpers/DTO/qb.message.model';
import { AuthService } from '../../users/services/auth.service';

@Pipe({
  name: 'chatNotification',
})
export class ChatNotificationPipe implements PipeTransform {
  constructor(public qbService: QBService,
    private auth: AuthService) { }

  transform(msg: qbMessage, args?: any): any {
    var self = this;
    return new Promise(function (resolve, reject) {
      let self_user = self.auth.currentUserValue.qbid;
      if (isEmptyObj(msg) == false) {
        let messageData = '';
        if (msg.notification_type) {
          let notify = parseInt(msg.notification_type);

          switch (notify) {
            case QBCONSTAND.NOTIFICATION_TYPES.NEW_DIALOG:
              messageData = 'Group created by ' + self.getProfileName(msg.sender_id);
              break;

            case QBCONSTAND.NOTIFICATION_TYPES.LEAVE_DIALOG:
              messageData = self.getProfileName(msg.sender_id) + ' left';
              break;

            case QBCONSTAND.NOTIFICATION_TYPES.REMOVE_DIALOG_BY_SOMEONE:
              messageData = self.getAgainstUserDetails(msg.against_user) + ' Removed by ' + self.getProfileName(msg.sender_id);
              break;

            case QBCONSTAND.NOTIFICATION_TYPES.ADD_NEW_USER_DIALOG:
              messageData = self.getAgainstUserDetails(msg.against_user) + ' Added by ' + self.getProfileName(msg.sender_id);
              break;

            case QBCONSTAND.NOTIFICATION_TYPES.MISSED_CALL:
              if (msg.sender_id == self_user) {
                messageData = 'Missed call';
              } else {
                messageData = ' Missed call from ' + self.getProfileName(msg.sender_id);
              }
              break;

            case QBCONSTAND.NOTIFICATION_TYPES.CALL_REPORT:
              messageData = ' Call ' + this.secToTime(msg.message);
              break;

          }
        }
        resolve(messageData);

      } else {
        resolve('')
      }
    });
  }

  secToTime(sec) {
    let given_seconds = parseInt(sec),

      dateObj = new Date(given_seconds * 1000),
      hours = dateObj.getUTCHours(),
      minutes = dateObj.getUTCMinutes(),
      seconds = dateObj.getSeconds();
    if (hours) {
      return hours.toString().padStart(2, '0')
        + ':' + minutes.toString().padStart(2, '0')
        + ':' + seconds.toString().padStart(2, '0');
    } else if (minutes) {
      return minutes.toString().padStart(2, '0')
        + ':' + seconds.toString().padStart(2, '0');
    } else {
      return seconds.toString().padStart(2, '0');
    }
  }

  getProfileName(qbid) {
    let username = this.qbService.getConnectionUserName(qbid);
    return username;
  }

  getAgainstUserDetails(user) {
    let memberName = '';
    var self = this;
    if (user) {
      let member = user.split(',');
      if (member.length) {
        memberName = member.map(a => self.getProfileName(parseInt(a))).join(',');
      }
    }
    return memberName;
  }

}
