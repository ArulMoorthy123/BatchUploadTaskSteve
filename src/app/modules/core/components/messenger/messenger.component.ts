import { Component } from '@angular/core';
import { AppConstServ } from './../../../../shared/helper/app-constant.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
})
export class MessengerComponent {
  CHAT_PROVIDER = AppConstServ.CHAT_PROVIDER;
  groupModal:boolean=false;

}
