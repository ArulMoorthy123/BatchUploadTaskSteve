import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const ep_session = `${environment.apiurl}/secure`;

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private http: HttpClient) { }

   // Get All Sessions
   getSessions(id) {
    return this.http.get(`${ep_session}/getSessionByUserId/${id}`).toPromise();
  }
  addSessions(data) {
    return this.http.post(`${ep_session}/session`,data).toPromise();
  }

  updateSessions(data) {
    return this.http.put(`${ep_session}/session`,data).toPromise();
  }

  // Get Session by id
  getSessionById(id: string) {
    return this.http.get(`${ep_session}/getSessionBySessionId/${id}`).toPromise();
  }

  // Delete Session
  deleteSession(id) {
    return this.http.delete(`${ep_session}/session/${id}`).toPromise();
  }

  // update Session url
  updateSessionUrl(id,sessionId) {
    return this.http.put(`${ep_session}/updateMesiboId/${id}/${sessionId}`,'').toPromise();
  }
}
