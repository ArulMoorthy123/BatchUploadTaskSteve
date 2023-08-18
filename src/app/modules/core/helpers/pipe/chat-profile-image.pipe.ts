import { Pipe, PipeTransform } from '@angular/core';
import { QBService } from '../../components/messenger/qb/services/qb.service';
import { QBHelperService } from '../../components/messenger/qb/helpers/qbHelper.service';

@Pipe({
  name: 'chatProfileImage',
})
export class ChatProfileImagePipe implements PipeTransform {
  constructor(public qbService: QBService,private qbHelper :QBHelperService) { }

  transform(user: any, args?: any): any {
    if (typeof user === 'object') {
      return this.qbHelper.getDialogueImage(user);
    }else {
      return this.qbService.getProfileImage(user);
    }
  }
}
