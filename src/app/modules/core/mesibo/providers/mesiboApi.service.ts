import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONFIG } from '../helpers/chat-constant';
import { environment } from '../../../../../environments/environment';
import { AuthService } from 'src/app/modules/users/services/auth.service';
declare var Mesibo: any;
@Injectable({
  providedIn: 'root'
})
export class MesiboApiService {
  appToken=CONFIG.MESIBO_ACCESS_TOKEN;
  appId=CONFIG.MESIBO_APP_NAME;
  excludeHeader ={ headers: { Anonymous: 'undefined' } };
  constructor(private http: HttpClient,private auth :AuthService) { }

  public login(email) {
    return this.http.get(`${CONFIG.MESIBO_API_URL}?op=login&email=${email}&token=${this.appToken}&appid=${this.appId}`,this.excludeHeader);
  }

  public userAdd(email) {
    let apiPayload= {
      token : this.appToken,
      appId : this.appId,
      email :email,
      name : this.auth.currentUserValue.firstName + this.auth.currentUserValue.lastName
    }
    return this.http.post(`${environment.apiurl}/secure/mesiboApicall`,apiPayload);
   //return this.http.get(`https://austin92jus.000webhostapp.com/backend/mesibotoken.php?token=${this.appToken}&appid=${this.appId}&addr=${email}`,this.excludeHeader);
  }

  public getAllUser() {
    return this.http.get(`${CONFIG.MESIBO_API_URL}?op=usersget&token=${this.appToken}&addr=*`,this.excludeHeader);
  }

  public createGroup(name,flag=0) {
    return this.http.get(`${CONFIG.MESIBO_API_URL}?op=groupadd&token=${this.appToken}&name=${name}&flag=${flag}`,this.excludeHeader);
  }
  public deleteGroup(id) {
    return this.http.get(`${CONFIG.MESIBO_API_URL}?op=groupdel&token=${this.appToken}&gid=${id}`,this.excludeHeader);
  }
  public updateGroup(name,flag=0) {
    return this.http.get(`${CONFIG.MESIBO_API_URL}?op=groupset&token=${this.appToken}&name=${name}&flag=${flag}`,this.excludeHeader);
  }
  public AddRemoveGroupMembers(gid,member,canSend,canRecieve,manage=0) {
    let canPub=1,cansub =1,canlist=1;
    //manage 0 for add 1 for remove
    return this.http.get(`${CONFIG.MESIBO_API_URL}?op=groupeditmembers&token=${this.appToken}&gid=${gid}&m=${member}&cs=${canSend}&cr=${canRecieve}&canlist=${canlist}&canpub=${canPub}&cansub=${cansub}&delete=${manage}`,this.excludeHeader);
  }
}
