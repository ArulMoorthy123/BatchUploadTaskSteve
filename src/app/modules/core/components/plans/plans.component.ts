import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Location } from '@angular/common';

import { AuthService } from './../../../users/services/auth.service';
import { UrlService } from 'src/app/shared/services/url.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { UsersService } from './../../../users/services/users.service';

import { PlansService } from './plans.service';
import { PLAN_MESSAGES, PLAN_TABS } from './helpers/plans.constant';
import { planHelper } from './helpers/index';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
})
export class PlansComponent implements AfterViewInit {
  @ViewChild('addPlanTemplate') addPlanTemplate;
  @ViewChild('viewPlanTemplate') viewPlanTemplate;
  @ViewChild('deletePlanTemplate') deletePlanTemplate;
  createModal: BsModalRef;
  viewModal: BsModalRef;
  deleteModal: BsModalRef;

  PLAN_MESSAGES = PLAN_MESSAGES;
  tabList = PLAN_TABS;
  activeTab = PLAN_TABS[0].id;
  loading = true;
  planList = [];
  taskId;
  currentUser;
  connectionList;
  deleteObj;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private modalService: BsModalService,
    private authService: AuthService,
    private utilityService: UtilityService,
    private usersService: UsersService,
    private plansService: PlansService
  ) {
    this.currentUser = planHelper.USE_STUB
      ? planHelper.getStubs('currentUser')
      : this.authService.getUserDetails();
    this.getConnections();
    this.fetchPlans();
  }

  ngAfterViewInit() {
    let id = this.route.snapshot.paramMap.get('taskId') || '';
    id && this.viewPlan(id);
  }

  changeTab(tabId) {
    this.activeTab = tabId;
  }

  async fetchPlans() {
    this.activeTab = PLAN_TABS[0].id;
    for await (const plan of PLAN_TABS) {
      await this.getPlanList(plan.uri, plan.id);
    }
  }

  createPlan() {
    this.createModal = this.modalService.show(this.addPlanTemplate, {
      class: 'modal-md', keyboard: false, ignoreBackdropClick: true
    });
  }

  viewPlan(id) {
    this.taskId = id;
    /* this.location.go(
      `${UrlService.USER_PAGE.PLANS_URL.split(/[/]+/).pop()}/${id}`
    ); */
    this.viewModal = this.modalService.show(this.viewPlanTemplate, {
      class: 'modal-xl', keyboard: false, ignoreBackdropClick: true
    });
  }

  closeModal(reload) {
    if(reload === true){
      this.fetchPlans();
    }
    this.location.go(UrlService.USER_PAGE.PLANS_URL.split(/[/]+/).pop());
    this.createModal && this.createModal.hide();
    this.viewModal && this.viewModal.hide();
  }

  confirmDelete(plan) {
    this.deleteObj = plan;
    this.deleteModal = this.modalService.show(this.deletePlanTemplate, {
      class: 'modal-md', keyboard: false, ignoreBackdropClick: true
    });
  }

  planDelete() {
    this.plansService
      .deletePlan(this.deleteObj, this.deleteObj.id)
      .then((res: any) => {
        if (res.taskDeleted) {
          this.showMessage(true);
          this.fetchPlans();
        } else {
          this.showMessage();
        }
      })
      .catch((err) => {
        this.showMessage();
      });
    this.cancelDelete();
  }

  getConnections() {
    this.usersService
      .getConnections(this.currentUser.emailId)
      .subscribe((data) => {
        this.connectionList = data ? data : [];
      });
  }

  async getPlanList(type, id) {
    let sort = id === 'completed' ? 'desc' : 'asc';
    await this.plansService
      .getPlansByType(type, this.currentUser.id)
      .then((res) => {
        this.planList[id] = res ? planHelper.sortBy(res, sort, 'dueDate') : [];
      })
      .catch((e) => {
        this.planList[id] = null;
      });
      this.loading = false;
      return this.loading;
  }

  setResponse(res, error) {
    return { res, error, loading: false };
  }

  cancelDelete() {
    this.deleteObj = null;
    this.deleteModal && this.deleteModal.hide();
  }

  showMessage(type = false) {
    this.utilityService.alertMessage(
      type ? 'success' : 'error',
      type ? PLAN_MESSAGES.DELETE_SUCCESS : PLAN_MESSAGES.COMMON_ERROR
    );
  }
}
