import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dialogueNotification',
})
export class DialogueNotificationPipe implements PipeTransform {
  constructor() { }

  transform(msg: any, args?: any): any {
    if(!msg) {
      return msg;
    }
    
    let message = msg.trim();
    let result;
    switch (message) {
      case '[attachment]':
        result = '<i class="fas fa-paperclip"></i>';
        break;
      case 'MISSED_CALL':
        result = '<i class="fas fa-phone"></i>';
        break;

      case 'ADD_NEW_MEMBER':
        result = '<i class="fas fa-user-plus"></i>';
        break;
      default:
        result = message;
        break;
    }
    return result;

  }


}
