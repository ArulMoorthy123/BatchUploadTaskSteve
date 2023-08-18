import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) { }

  getUsers() {
    return false;
  }
  public login(user) {
    //const headers = new HttpHeaders({ Authorization: 'Basic ' + btoa(user.email + ':' + user.password) });
    return this.http.post(`${environment.apiurl}/nonsecure/cj/token`, user);
  }
  public registeruser(user) {
    return this.http.post(`${environment.apiurl}/nonsecure/registerUser`, user);
  }
  public validateEmail(email) {
    return this.http.get(`${environment.apiurl}/nonsecure/verifyEmailForUnique/${email}`);
  }
  public validateMobile(mobile) {
    return this.http.get(`${environment.apiurl}/nonsecure/verifyMobileForUnique/${mobile}`);
  }
  public inviteUser(email,userId) {
    return this.http.post(`${environment.apiurl}/secure/ua/sendInvitation/${email}/USER/${userId}`,null);
  }
  public updatePassword(data) {
    return this.http.post(`${environment.apiurl}/secure/changepassword`,data,{ responseType: 'text' });
  }

  public forgotPassword(email) {
    return this.http.post(`${environment.apiurl}/nonsecure/forgotpassword/${email}`,null);
  }

  public resetPassword(data) {
    return this.http.post(`${environment.apiurl}/nonsecure/resetpassword`,data);
  }

  public saveProfile(data) {
    return this.http.post(`${environment.apiurl}/secure/ua/saveprofile`,data);
  }
  public getProfile(userid) {
    return this.http.get(`${environment.apiurl}/secure/ua/getprofile/${userid}`);
  }

  public getSkills(searchString) {
    return this.http.get(`${environment.apiurl}/nonsecure/ua/searchSkill?name=${searchString}`);
  }

  public getConnections(userEmail) {
    return this.http.get(`${environment.apiurl}/secure/display/getConnections/${userEmail}`)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  public getAllRecommendations(userEmail) {
    return this.http.get(`${environment.apiurl}/secure/recommend/getAllRecommendations/${userEmail}`);
  }

  public getSearchConnection(userEmail,searchString) {
    return this.http.get(`${environment.apiurl}/secure/ua/searchConnection/${userEmail}/${searchString}`);
  }

  public connectToUser(loggedInUserEmail,connectToEmail) {
    return this.http.post(`${environment.apiurl}/secure/ua/connectUser/${loggedInUserEmail}/${connectToEmail}`,null);
  }

  public getAllReceivedInvites(userEmail) {
    return this.http.get(`${environment.apiurl}/secure/display/receivedInvitesList/${userEmail}`);
  }

  public getAllSentInvites(userEmail) {
    return this.http.get(`${environment.apiurl}/secure/display/sentInvitesList/${userEmail}`);
  }

  public confirmConnectionRequest(loggedInUserEmail,confirmUserEmail) {
    return this.http.post(`${environment.apiurl}/secure/confirm/${loggedInUserEmail}/${confirmUserEmail}`,null);
  }

  public declineConnectionRequest(loggedInUserEmail,declineUserEmail) {
    return this.http.post(`${environment.apiurl}/secure/decline/${loggedInUserEmail}/${declineUserEmail}`,null);
  }

  public ignoreConnectionRequest(loggedInUserEmail,ignoreUserEmail) {
    return this.http.post(`${environment.apiurl}/secure/ignore/${loggedInUserEmail}/${ignoreUserEmail}`,null);
  }

  public deleteConnection(loggedInUserEmail,deleteUserEmail) {
    return this.http.put(`${environment.apiurl}/secure/ua/deleteConnection/${loggedInUserEmail}/${deleteUserEmail}`,null);
  }

  public sendMessage(data) {
    return this.http.post(`${environment.apiurl}/secure/ua/sendMessage/`,data);
  }

  public updateQbid(email,qbid) {
    return this.http.put(`${environment.apiurl}/nonsecure/ua/updateqbid?qbid=${qbid}&userEmail=${email}`,null);
  }

  public getChatConnectionList(email) {
    return this.http.get(`${environment.apiurl}/secure/ua/connectedUserList?email=${email}`);
  }

  public createGroup(data) {
    return this.http.post(`${environment.apiurl}/secure/createGroup`,data);
  }

  public getUserGroups(userId) {
    return this.http.post(`${environment.apiurl}/nonsecure/grouplist?createdBy=${userId}`,null)
    .pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  public deleteGroup(groupId) {
    return this.http.post(`${environment.apiurl}/nonsecure/deletegroup?groupId=${groupId}`,null);
  }

  public sendMessageToGroup(data) {
    return this.http.post(`${environment.apiurl}/secure/ua/sendMessageInGroup/`,data);
  }

  public editMember(data) {
    return this.http.post(`${environment.apiurl}/secure/editGroupMember`,data);
  }

  public deleteMember(data) {
    return this.http.post(`${environment.apiurl}/secure/deleteMember`,data);
  }

  public createPost(data) {
    return this.http.post(`${environment.apiurl}/secure/post/`,data);
  }

  public listPost(data) {
    return this.http.post(`${environment.apiurl}/secure/postlist/`,data);
  }

  public viewPost(postId) {
    return this.http.get(`${environment.apiurl}/secure/viewPost?postId=${postId}`);
  }

  public commentOnPost(data) {
    return this.http.post(`${environment.apiurl}/secure/postComment/`,data);
  }

  public deletePost(postId) {
    return this.http.post(`${environment.apiurl}/secure/deletePost?postId=${postId}`,null);
  }

  public deleteComment(commendId) {
    return this.http.post(`${environment.apiurl}/secure/deleteComment/`,commendId);
  }

  public addTask(data) {
    return this.http.post(`${environment.apiurl}/secure/addTask`,data);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }


}
