import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
import { planHelper } from './helpers/index';
const ep_plan = `${environment.apiurl}/secure`;

@Injectable({
  providedIn: 'root',
})
export class PlansService {
  constructor(private http: HttpClient) {}

  // Get Plans by type (todoList | watchlistTab | completedTab)
  getPlansByType(type: string, userId: string) {
    let qKey = type !== 'completedTab' ? 'userId' : 'createById';
    return planHelper.USE_STUB
      ? this.useStubs(type)
      : this.http.get(`${ep_plan}/${type}?${qKey}=${userId}`).toPromise();
  }

  // Get Plan by id
  getPlanById(id: string) {
    return planHelper.USE_STUB
      ? this.useStubs('todoList')
      : this.http.get(`${ep_plan}/viewTask?taskId=${id}`).toPromise(); 
  }

  // Add Plan
  addPlan(objPlan) {
    return planHelper.USE_STUB
      ? this.useStubs('todoList')
      : this.http.post(`${ep_plan}/addTask`, objPlan).toPromise();
  }

  // Update Plan
  updatePlan(objPlan) {
    return planHelper.USE_STUB
      ? this.useStubs('todoList')
      : this.http.post(`${ep_plan}/edittask`, objPlan).toPromise();
  }

  // Delete Plan
  deletePlan(objPlan, id: string) {
    return planHelper.USE_STUB
      ? this.useStubs('todoList')
      : this.http.post(`${ep_plan}/deletetask?taskId=${id}`, objPlan).toPromise();
  }

  getConnections(userEmail) {
    return planHelper.USE_STUB
      ? this.useStubs('connections')
      : this.http
          .get(`${ep_plan}/display/getConnections/${userEmail}`)
          .toPromise();
  }

  useStubs(type) {
    return new Promise((resolve) => {
      setTimeout(resolve, planHelper.responseTime, planHelper.getStubs(type));
    });
  }
}
