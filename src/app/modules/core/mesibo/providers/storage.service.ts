import { Injectable } from '@angular/core';
// import { Storage } from '@ionic/storage';
// import { chat, message, chatList } from '../interfaces/chat';

@Injectable({
  providedIn: 'root'
})

export class StorageService {
//   private messageStorage: Storage;
//   private contactStorage: Storage;
//   contactsLastUpdate:any;
//   constructor() { }

//   getMessagesFromStorage() {
//     let ml = JSON.parse(localStorage.getItem("CJ_Messages")) || [];
//     return ml;
//   }

//   updateMessagesInStorage(messageList) {
//     localStorage.setItem("CJ_Messages", JSON.stringify(messageList));
//   }

//   getContactsFromStorage() {
//     let cl = JSON.parse(localStorage.getItem("CJ_Contacts")) || {};
//     if (0 !== Object.keys(cl).length) {
      
//       let u = cl['u'];
      
//       let selfUser = {
//         id: 0, //Main User
//         name: u['name'],
//         number: u['phone'],
//         pic: u['photo']
//       };
//       //this.user = selfUser;
//       this.contactsLastUpdate = cl['ts'];
//     // cl = cl['contacts'].filter(function (contact) {
//     //     return contact.gid == 0; //Do not load groups
//     // });
//       cl = this.syncContactList(cl);
//   }

//     return cl;
//   }


//   syncContactList(c) {
//     let cl = [];
//     if (!c) return;
  
//     for (var i = 0; i < c.length; i++) {
//       var e = {};
//       e['id'] = i + 1;
//       e['name'] = c[i]['name'];
//       e['number'] = c[i]['phone'];
//       e['pic'] = '';
//       e['status'] = c[i]['status'];
//       cl.push(e);
//     }
//     return cl;
//   }

// }


// export class MessageService{
//   listMessage: any=[];
//   listChat: any=[];
//   constructor(private storage: Storage){
//    //this.storage is the same global storage
//   }
  
  
//   async getAllMessage() {
//     const allMessages: message[] =  await this.storage.get('PEER_MESSAGES');
//     return allMessages;
//   }

//   getMessage(){
//     return this.listMessage;
//   }

//   getLastUnreadMessage(peer) {
//     for (var i = this.listMessage.length - 1; i >= 0; i--)
//       if (peer == this.listMessage[i]['params']['peer']) {
//         var mid = this.listMessage[i]['read_status'] ? 0 : this.listMessage[i]['id'];
//         return mid;
//       }
  
//     return 0; 
//   }

  
//   public async updateMessage(message: message) {
//     this.storage.set('PEER_MESSAGES', this.listMessage);
//   }


//   async getAllChat() {
//     const allChat: chat[] =  await this.storage.get('PEER_CONTACT');
//     allChat.forEach((chat: chat): void => {
//     this.listChat.push(allChat);
//     });
//   }
  

//   public async saveChat(chat: chat): Promise<void> {
//     const allChat: chat[] = await this.storage.get('PEER_CONTACT');
//     allChat.push(chat)
//     this.storage.set('PEER_MESSAGES', allChat);
//   }


}
