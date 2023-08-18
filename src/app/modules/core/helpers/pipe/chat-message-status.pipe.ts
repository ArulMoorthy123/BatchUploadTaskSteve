import { Pipe, PipeTransform } from '@angular/core';
import { isEmptyObj } from '../../mesibo/helpers/utilityHelper';
import { QBMessageService } from '../../components/messenger/qb/services/qbMessage.service';
import { qbMessage } from '../../components/messenger/qb/helpers/DTO/qb.message.model';

@Pipe({
  name: 'chatMessageStatus',
  pure: false 
})
export class ChatMessageStatusPipe implements PipeTransform {
  constructor(public qbMessage: QBMessageService) { }

  transform(chat: qbMessage, args?: any): any {
    var self = this;
      let messageStatus = '';
      if (isEmptyObj(chat)) {
       return messageStatus;
      } else {
        messageStatus = self.qbMessage.getMessageStatus(chat);
        return messageStatus;
      }
  }
}
