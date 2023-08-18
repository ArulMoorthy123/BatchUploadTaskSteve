import { Injectable } from '@angular/core';
import { CONFIG } from '../helpers/chat-constant';
import { Subject, Observable } from 'rxjs';
declare var Mesibo: any;
declare const MESIBO_STATUS_ONLINE, MESIBO_STATUS_CONNECTING, MESIBO_STATUS_CONNECTFAILURE, MESIBO_STATUS_SIGNOUT, MESIBO_STATUS_AUTHFAIL;
declare const MESIBO_CALLSTATUS_COMPLETE, MESIBO_CALLSTATUS_RINGING, MESIBO_CALLSTATUS_ANSWER, MESIBO_CALLSTATUS_BUSY, MESIBO_CALLSTATUS_NOANSWER, MESIBO_CALLSTATUS_INVALIDDEST, MESIBO_CALLSTATUS_UNREACHABLE, MESIBO_CALLSTATUS_OFFLINE;
import { Notify } from '../providers/mesibo_notify';
import * as utility from '../helpers/utilityHelper';
import { chatList, chat } from '../helpers/DTO/chat';
import { VideoCallService } from './video-call.service';
import { MesiboApiService } from './mesiboApi.service';
import { AuthService } from '../../../users/services/auth.service';
import { conference } from '../../components/messenger/qb/helpers/qb.model';
import { UserData } from '../helpers/DTO/users';
@Injectable({
  providedIn: 'root'
})
export class ChatService extends VideoCallService {

  public apiObj: any;
  public observeEvents: any;
  public sessionSummery: any = {};
  public recentChatList: chatList = [];
  public selectedChat: any = {};
  public selfUser: UserData=({} as any) as UserData;
  public connectionStatus: number = 0;
  coneferenceData: conference[];
  constructor(private mesiboApi: MesiboApiService, private auth: AuthService) {
    super();
    this.observeEvents = new Subject<any>();
  }

  /*Observable Declaration For Messages: Start */
  getObserverEvents(): Observable<any> {
    return this.observeEvents.asObservable();
  }

  //To initialize Mesibo using User's Access Token
  async init(userAccessToken: string) {
    try {
      this.apiObj = new Mesibo();
    } catch {
      this.init(userAccessToken);
    }
    this.selfUser.token=userAccessToken;
    this.apiObj.setAppName(CONFIG.MESIBO_APP_NAME);
    this.apiObj.setCredentials(userAccessToken),
      this.apiObj.setListener(new Notify(this));
   // this.apiObj.setDatabase('CJ-new', 0),
      this.apiObj.start(),
      this.appSession = this.apiObj,
      this.setSessionSummery();
    this.videoSession = this.apiObj;
    console.log(this.apiObj, '  api object');
  }

  //set mesibo database session summery
  setSessionSummery() {
    this.sessionSummery = this.apiObj.readDbSession(null, 0, null);
    console.log(this.sessionSummery, ' Session Summary');
    this.sessionSummery.enableReadReceipt(true),
      this.getRecentContact();
  }

  //getConnectionStatus 
  getConnectionStatus() {
    let statusObj: any = {};
    statusObj.status = false;
    switch (this.connectionStatus) {
      case MESIBO_STATUS_ONLINE:
        statusObj.status = true;
        statusObj.value = 'Online';
        if (!this.auth.loginStatus()) {
          this.logout();  // if not login automatically logout mesibo Itself;
        }
        break;
      case MESIBO_STATUS_CONNECTFAILURE:
        statusObj.value = "Connection Failed";
        break;
      case MESIBO_STATUS_SIGNOUT:
        statusObj.value = "Signed out";
        break;
      case MESIBO_STATUS_AUTHFAIL:
        statusObj.value = "Authentication Failed: Bad Token or App ID";
        break;
      default:
        statusObj.value = "You are offline";
        break;
    }
    console.log(statusObj, 'mesibo status');
    return statusObj;
  }

  // selected the chat 
  assignSelectChat(chat) {
    this.selectedChat.groupid = chat.groupid ? chat.groupid : '';
    this.selectedChat.address = chat.email ? chat.email : '';
    this.selectedChat.name = chat.name ? chat.name : '';
  }
  //pass notification to application
  notifyListenersData(type, value, status) {
    this.observeEvents.next({ type: type, data: value, status: status });
  }

  // clear All the Connection 
  async logout() {
    if (utility.isEmptyObj(this.apiObj) == false) {
      await this.apiObj.stop();
    }
    this.apiObj = {};
    this.clearCall();
  }

  //get recent contact details
  getRecentContact() {
    let userList = this.sessionSummery.getMessages();
    this.recentChatList = userList;
    console.log(this.recentChatList, ' user profile');
  }
  //syn contact with remote system
  synWithChatList(user) {
    let address = user.address ? user.address : '';
    let groupid = user.groupid ? user.groupid : 0;
    var index = this.recentChatList.findIndex(x => x.groupid == groupid && x.address == address);
    if (index === -1)
      this.recentChatList.push(user);
  }

  // select new chat area
  addNewSelectedUser(selectedChat) {
    let address = selectedChat.address ? selectedChat.address : '';
    let groupid = selectedChat.groupid ? selectedChat.groupid : 0;

    if (utility.isGroup(selectedChat))
      this.synWithChatList(selectedChat);
    let user = this.recentChatList.filter(a => a.groupid == groupid && a.address == address)
    this.selectedChat = selectedChat;
  }


  getUserToken(email): Promise<any> {
    return this.mesiboApi.userAdd(email).toPromise();
  }

  createGroup(name, member = [], config: any): Promise<any> {
    let flag = 16916994;// 139842;
    let grouRes;
    return this.mesiboApi.createGroup(name, flag).toPromise().then((res: any) => {
      grouRes = res;
      return this.mesiboApi.AddRemoveGroupMembers(res.group.gid, member, 1, 1, 0).toPromise();
    }).then((res: any) => {
      return grouRes;
    });
    //.flatMap(d=> this.mesiboApi)
  }

  addNewMember(gid, member) {
    return this.mesiboApi.AddRemoveGroupMembers(gid, member, 1, 1, 0).toPromise();
  }
  removeMember(gid, member = []): Promise<any> {
    return this.mesiboApi.AddRemoveGroupMembers(gid, member, 1, 1, 1).toPromise();
  }

  updateGroup(name, flag) {
    return this.mesiboApi.createGroup(name, flag).toPromise();
  }

}
