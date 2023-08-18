import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatService } from './chat.service';
@Injectable({
  providedIn: 'root'
})


export class UtilityService {
  loading: boolean = false;
  alert: any;
  constructor() { }

  // showToast(status = null, msg = null) {
  //   let message, btnText: any, color;
  //   switch (status) {
  //     case 'error':
  //       message = msg ? msg : 'Something Went Wrong',
  //         btnText = 'OH',
  //         color = 'danger';
  //       break;

  //     case 'warning':
  //       message = msg ? msg : 'kind reminder you',
  //         btnText = 'Attention',
  //         color = 'warning';
  //       break;

  //     case 'info':
  //       message = msg ? msg : 'notification',
  //         btnText = '',
  //         color = 'secondary';
  //       break;

  //     default:
  //       message = msg ? msg : ' Freaking Success ',
  //         btnText = 'YEAH',
  //         color = 'success';
  //       break;
  //   }
  //   this.alert = this.toast.create({
  //     message: message,
  //     color: color,
  //     position: "top",
  //     animated: true,
  //     // cssClass:"my-custom-class"
  //     duration: 2000
  //   }).then((toastData) => {
  //     toastData.present();
  //   });
  // }
  
  // HideToast() {
  //   this.alert = this.toast.dismiss();
  // }

  // //get name by id 
  // // getName(user) {
  // //   if (typeof user !== 'object') {
  // //     return '';
  // //   }

  // //   if (user.name)
  // //     return user.name;

  // //   if (user.address) {
  // //     let data = this.chatService.recentChatList.filter(a => a.address == user.address);
  // //     if (data[0].name)
  // //       return data[0].name;
  // //     else  // later add http call syn with cloud 
  // //       return data[0].address;
  // //   }
  // // }

  // tone: any;
  // ringTone;

  // stoRingTone() {
  //   if (this.ringTone)
  //     this.ringTone.pause();
  // }

  // ringTonePlay(action) {
  //   switch (action) {
  //     case "CALL":
  //       this.ringTone = new Audio("assets/tone/ringtone.mp3");
  //       this.ringTone.play();
  //       break;

  //     case "JOIN":
  //       this.ringTone = new Audio("assets/tone/join.mp3");
  //       this.ringTone.play();
  //       break;
  //     default:
  //       break;
  //   }
  // }

}
