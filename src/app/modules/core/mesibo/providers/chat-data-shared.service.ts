import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MESSAGE_TYEPE } from '../helpers/chat-constant';
declare const MESIBO_FLAG_DEFAULT :any;
declare const MESIBO_FLAG_DELIVERYRECEIPT, MESIBO_FLAG_READRECEIPT,MESIBO_FLAG_TRANSIENT,MESIBO_FLAG_EOR,MESIBO_ORIGIN_REALTIME ;
@Injectable({
  providedIn: 'root'
})
export class ChatDataSharedService {
  public chatList:any=[];
  public selectedChat = [];
  public selfUser:any={};

}
