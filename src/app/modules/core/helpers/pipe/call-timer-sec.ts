import { Pipe, PipeTransform } from '@angular/core';
import { QBMessageService } from '../../components/messenger/qb/services/qbMessage.service';

@Pipe({
  name: 'secToTime'
})
export class secToTimePipe implements PipeTransform {
  transform(sec: any, ...args: unknown[]): any {
  return new Date(sec * 1000).toISOString().substr(11, 8)
  }

}
