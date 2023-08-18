import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import {
  qbAccount,
  QBCONFIG,
  qbPassword,
  QBCONSTAND,
  QB_CONNECTION_STATUS,
} from '../../../../helpers/app.config';
import { QbUsers, connection } from '../helpers/qb.model';
import { AppConstServ } from '../../../../../../shared/helper/app-constant.service';
import { environment } from '../../../../../../../environments/environment';
import { AuthService } from '../../../../../users/services/auth.service';
import { checkInternet } from '../../../../../../shared/helper/utilityHelper';

declare var QB: any;
@Injectable({
  providedIn: 'root',
})
export class QBService {
  qbSession: QbUsers = {};
  observeQBEvents: any;
  contactList: any = {};
  connectionStatus: any = false;
  constructor(private auth: AuthService) {
    this.observeQBEvents = new Subject<any>();
  }

  init() {
    QB.init(qbAccount.appId, qbAccount.authKey, qbAccount.authSecret, qbAccount.accountKey, QBCONFIG);
  }

  public getSession() {
    return QB && QB.service ? QB.service.getSession() : null;
  }

  getConnectionStatus() {
    if(!QB) {
      return false;
    }
    if (!checkInternet()) {
      return QB_CONNECTION_STATUS.OFFLINE;
    }

    if ('chat' in QB == false) {
      return QB_CONNECTION_STATUS.NOT_INITIALIZED;
    }

    if ('connection' in QB.chat == false) {
      return QB_CONNECTION_STATUS.NOT_YET_LOGGED_IN;
    }
    if (QB.chat.connection.do_authentication == false) {
      return QB_CONNECTION_STATUS.NOT_YET_LOGGED_IN;
    } else if (QB.chat._isConnecting) {
      return QB_CONNECTION_STATUS.CONNECTING;
    } else if (QB.chat._isLogout) {
      return QB_CONNECTION_STATUS.LOGGED_OUT;
    } else if (QB.chat.isConnected == false) {
      return QB_CONNECTION_STATUS.DISCONNECT;
    }

    if (QB.chat.isConnected) {
      return QB_CONNECTION_STATUS.CONNECTED;
    }

  }

  setSession() {
    this.qbSession = JSON.parse(sessionStorage.getItem('session'));
    QB.service.setSession(JSON.parse(sessionStorage.getItem('session')));
  }

  getObserverEvents(): Observable<any> {
    return this.observeQBEvents.asObservable();
  }

  setEvent(type, data, status) {
    this.observeQBEvents.next({
      type: type, data: data, status: status
    });
  }

  getQBStatus() {
    return this.getSession() ? this.getSession() : false;
  }

  public appSession(): Promise<any> {
    return new Promise((resolve, reject) => {
      QB.createSession(function (sessionErr, sessionRes) {
        if (sessionErr) {
          reject(sessionErr);
        } else {
          QB.service.setSession(sessionRes),
            console.log(sessionRes, 'session response')
          sessionStorage.setItem('session', JSON.stringify(sessionRes));
          resolve(sessionRes);
        }
      });
    });
  }

  public qbCreateConnection(user): Promise<any> {
    var self = this;
    this.connectionStatus = 'LOGGING';
    return new Promise((resolve, reject) => {
      this.appSession()
        .then((sessionResponse) => { })
        .then((sessionResponse) => {
          const params = {
            login: user,
            password: qbPassword

          };
          QB.login(params, function (loginErr, loginRes) {
            if (loginErr) {
              console.log(loginErr)
              reject(loginErr);
            } else {
              console.log(loginRes);
              let qbSession: any = JSON.parse(
                sessionStorage.getItem('session')
              );
              qbSession.user_id = loginRes.id;
              QB.service.setSession(qbSession);
              self.connectionStatus = 'LOGGED_IN';
              sessionStorage.setItem('session', JSON.stringify(qbSession));
              resolve(loginRes);
            }
          });
        })
        .catch((error) => {
          console.log(error);
          error.status = 401;
          reject(error);
        });
    });
  }

  public setContactList(contact: connection[]) {
    this.contactList = contact.reduce((obj, item) => {
      item.qbid = +item.qbid, //qbid must be number
        obj[item.qbid] = item;
      return obj;
    }, {});
    //console.log(this.contactList,'contact list');
  }

  public sendUser(userId) {
    QB.chat.getLastUserActivity(userId);
  }


  public chatConnect(userId = null): Promise<any> {
    //this.init();
    var self = this;
    this.setSession();
    const params = {
      userId: userId || this.qbSession.user_id,
      password: qbPassword,
    };
    return new Promise((resolve, reject) => {
      QB.chat.connect(params, function (chatErr, chatRes) {
        if (chatErr) {
          console.log(chatErr);
          self.chatConnect(); // re connect
          reject(chatErr);
        } else {
          self.connectionStatus = 'CONNECTED';
          //this.observeQBEvents.next({ type: 'chatConnected', data: chatRes,status : true })
          console.log('chat connection successfully');
          resolve(chatRes);
        }
      });
    });
  }

  public getUserList(args): Promise<any> {
    if (typeof args !== 'object') {
      args = {};
    }
    const
      self = this,
      params = {
        filter: {
          field: args.field || 'full_name',
          param: 'in',
          value: args.value || [args.full_name || '']
        },
        order: args.order || {
          field: 'updated_at',
          sort: 'desc'
        },
        page: args.page || 1,
        per_page: args.per_page || 100
      };

    return new Promise(function (resolve, reject) {
      QB.users.listUsers(params, function (userErr: any, usersRes: any) {
        if (userErr) {
          reject(userErr);
        } else {
          console.log('User List === ', usersRes);
          const users = usersRes.items.map((userObj: any) => {
            //self.addToCache(userObj.user);
            return userObj.user;
          });
          resolve(users);
        }
      });
    });
  }

  getUser(searchParams): Promise<any> {
    return new Promise(function (resolve, reject) {
      QB.users.get(searchParams, function (error, user) {
        if (error) {
          reject(error)
        } else {
          resolve(user);
        }
      });
    });
  }

  registerUser(userDetails): Promise<any> {
    userDetails.password = qbPassword;
    return new Promise(function (resolve, reject) {
      QB.users.create(userDetails, function (error, user) {
        if (error) {
          reject(error)
        } else {
          resolve(user);
        }
      });
    });
  }

  updateUser(userDetails): Promise<any> {
    return new Promise(function (resolve, reject) {
      QB.users.update(userDetails, function (error, user) {
        if (error) {
          reject(error)
        } else {
          resolve(user);
        }
      });
    });
  }
  //get Profile Image by id
  getProfileImage(qbId) {
    let def = AppConstServ.DEFAULT_PROFILE_URL,
      qbid = parseInt(qbId);
    if (this.auth.currentUserValue.qbid == qbid) {
      if (this.auth.currentUserValue.profileImageUrl) {
        return environment.apiurl + this.auth.currentUserValue.profileImageUrl;
      }
    }
    else if (this.contactList[qbid]) {
      if (this.contactList[qbid].profileImageUrl) {
        return environment.apiurl + this.contactList[qbid].profileImageUrl;
      }
    }
    return def;
  }

  //get name by id
  getConnectionUserName(qbId): string {
    let def = 'guest ' + qbId,
      qbid = parseInt(qbId);
    if (this.auth.currentUserValue.qbid == qbid) {
      return 'You';
    }
    else if (this.contactList[qbid]) {
      return this.contactList[qbid].firstName + ' ' + this.contactList[qbid].lastName;
    }
    return def;
  }


  async getUserById(id) {
    if (this.contactList[id]) {
      return this.contactList[id];
    } else {
      let data = await this.getUserList({ field: 'id', param: 'in', value: [id] });
      return data[0];
    }
  }


  destroySession() {
    if (this.getQBStatus()) {
      QB.chat.disconnect();
      QB._isLogout = true,
        QB.destroySession(function (err) {
          // callback function
        });
    }
  }

}
