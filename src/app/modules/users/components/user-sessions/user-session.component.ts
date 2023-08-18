import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../../core/mesibo/providers/chat.service';
import { UrlService } from '../../../../shared/services/url.service';
import { Router, NavigationExtras } from '@angular/router';


@Component({
  selector: 'user-session',
  templateUrl: './user-session.component.html',
  styleUrls: ['./user-session.component.scss']
})

export class UserSessionComponent implements OnInit {
  constructor(public chatService: ChatService,private router: Router) { }

  get connectionStatus() {
    let con = this.chatService.getConnectionStatus();
    return con.value;
  }
  ngOnInit(): void { }

  makeCall(col){
    this.chatService.selectedChat=col;
    let navigationExtras: NavigationExtras = {
      queryParams: {action : 'START_CALL',id : col.groupid}
    };
    this.router.navigateByUrl(UrlService.USER_PAGE.CONFERENCE_URL,navigationExtras);
  }

  joinCall(col){
    this.chatService.selectedChat=col;
    let navigationExtras: NavigationExtras = {
      queryParams: {action : 'JOIN_CALL',id : col.groupid}
    };
    this.router.navigateByUrl(UrlService.USER_PAGE.CONFERENCE_URL,navigationExtras);
  }
}
