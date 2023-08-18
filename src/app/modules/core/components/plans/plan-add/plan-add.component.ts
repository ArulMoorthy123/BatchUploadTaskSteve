import {
  Component, OnInit, EventEmitter, Output, Input,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { UtilityService } from 'src/app/shared/services/utility.service';
import { UrlService } from 'src/app/shared/services/url.service';
import { PlansService } from './../plans.service';
import { PLAN_MESSAGES } from '../helpers/plans.constant';
import { planHelper } from './../helpers/index';
import { AppConstServ } from 'src/app/shared/helper/app-constant.service';

@Component({
  selector: 'app-plan-add',
  templateUrl: './plan-add.component.html',
  styleUrls: ['./plan-add.component.scss'],
})
export class PlanAddComponent implements OnInit {
  @Input() currentUser;
  @Input() connectionList;
  @Output() onCloseEvent = new EventEmitter<boolean>();
  @Output() onAddSuccess = new EventEmitter<void>();

  planForm: FormGroup;
  urlServices = UrlService;
  REG_EX = AppConstServ.REG_EX;
  dropdownSettings: any = {};
  submitted: boolean = false;
  minDate = new Date();
  reloadPlans = false;
  hideAssignBox = true;

  constructor(
    private utilityService: UtilityService,
    private plansService: PlansService
  ) {}

  ngOnInit(): void {
    this.dropdownSettings = { ...planHelper.dropDownConfig };
    this.planForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      dueDate: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      assignedTo: new FormControl(null),
      sharedDoc_link: new FormControl(null, Validators.pattern(AppConstServ.REG_EX.URL)),
    });
  }

  apiPayload() {
    let payload: any = {};
    let formData = new FormData();
    payload.title = this.planForm.value.title || '';
    payload.desc = this.planForm.value.description || '';
    payload.sharedDoc_link = this.planForm.value.sharedDoc_link || '';
    payload.created_by = this.currentUser.id;
    payload.dueDate = new Date(this.planForm.value.dueDate).toISOString();
    payload.assignMember = this.planForm.value.assignedTo
      ? this.planForm.value.assignedTo[0].userId
      : '';
    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });
    return formData;
  }

  // save Plans
  savePlan() {
    this.submitted = true;
    if (this.planForm.valid) {
      this.plansService
        .addPlan(this.apiPayload())
        .then((res: any) => {
          if (res.taskCreated) {
            this.showMessage(true);
            this.reloadPlans = true;
            this.closeModal();
          } else {
            this.showMessage();
          }
        })
        .catch((err) => {
          this.showMessage();
        })
        .finally(() => {
          this.submitted = false;
        });
    }
  }

  showMessage(type = false) {
    this.utilityService.alertMessage(
      type ? 'success' : 'error',
      type ? PLAN_MESSAGES.ADD_SUCCESS : PLAN_MESSAGES.COMMON_ERROR
    );
  }

  closeModal() {
    this.onCloseEvent.emit(this.reloadPlans);
  }
  
}
