import { Pipe, PipeTransform } from '@angular/core';
import { QBMessageService } from '../../components/messenger/qb/services/qbMessage.service';

@Pipe({
  name: 'chatFileUrl'
})
export class ChatFileUrlPipe implements PipeTransform {
  constructor(public qbMessage: QBMessageService) { }
  transform(fileId: any, ...args: unknown[]): any {
    return  this.qbMessage.getFileUrl(fileId);
  }

}
