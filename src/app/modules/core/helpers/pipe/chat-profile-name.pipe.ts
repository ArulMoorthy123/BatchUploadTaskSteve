import { Pipe, PipeTransform } from '@angular/core';
import { QBService } from '../../components/messenger/qb/services/qb.service';

@Pipe({
  name: 'chatProfileName',
})
export class ChatProfileNamePipe implements PipeTransform {
  constructor(public qbService: QBService) { }

  transform(qbUserId: number, args?: any): any {
    var self = this;
    return new Promise(function (resolve, reject) {
      let profileName = '';
      if (qbUserId == null || qbUserId == 0) {
        resolve(profileName);
      }else {
       let name= self.qbService.getConnectionUserName(qbUserId);
       resolve(name);
      }
       
    });
  }
}
