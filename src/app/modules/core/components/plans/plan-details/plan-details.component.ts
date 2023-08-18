import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Attachment } from './../helpers/plans.dto';
import { PLAN_STATUS, PLAN_MESSAGES } from './../helpers/plans.constant';
import { PlansService } from './../plans.service';
import { planHelper } from './../helpers/index';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AppConstServ } from 'src/app/shared/helper/app-constant.service';

@Component({
  selector: 'app-plan-details',
  templateUrl: './plan-details.component.html',
  styleUrls: ['./plan-details.component.scss'],
})
export class PlanDetailsComponent implements OnInit {
  @Input() taskId;
  @Input() currentUser;
  @Input() connectionList;
  @Output() onCloseEvent = new EventEmitter<boolean>();
  loading = true;
  showError = false;
  planDetails;
  PLAN_STATUS = PLAN_STATUS;
  REG_EX = AppConstServ.REG_EX;
  statusOption = Object.values(PLAN_STATUS);
  planForm: FormGroup;
  messages = PLAN_MESSAGES;
  alert = { ...planHelper.alertObj };
  ddSettings = { ...planHelper.dropDownConfig };
  minDate: Date;
  editAssignedTo = false;
  isEditable = false;
  submitted = false;
  hasMessage = false;
  btnDisabled = false;
  isOwner = false;
  reloadPlans = false;
  defaultComment = '';

  constructor(
    private formBuilder: FormBuilder,
    private utilityService: UtilityService,
    private plansService: PlansService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.getData();
    this.planForm = this.formBuilder.group(planHelper.planFormControls);
  }

  getData() {
    this.plansService
      .getPlanById(this.taskId)
      .then((res) => {
        this.planDetails = res ? res[0] : [];
        if (res) {
          this.planDetails.assigned_to = [
            {
              id: this.planDetails.assigned_to.id,
              name: this.planDetails.assigned_to.name,
              userId: this.planDetails.assigned_to.id,
              fullName: this.planDetails.assigned_to.name,
            },
          ];
          this.setPermission(res[0]);
          this.planForm.patchValue(res[0]);
          res[0]?.comments &&
            this.planForm.patchValue({
              comments: planHelper.sortBy(
                res[0]?.comments,
                'asc',
                'created_on'
              ),
            });
          if (res[0].dueDate) {
            let objDueDate = new Date(res[0].dueDate);
            this.minDate = new Date() > objDueDate ? objDueDate : new Date();
            this.planForm.patchValue({
              dueDate: objDueDate,
            });
          }
        }
      })
      .catch(() => {
        this.showError = true;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  viewAttachment(file: Attachment) {
    console.log('Attachment', file);
  }

  toggleAssignedTo(flag: boolean) {
    this.editAssignedTo = !flag;
  }

  payload() {
    return {
      taskId: this.planForm.value.id,
      created_by: this.planForm.value.created_by.id,
      assigned_to: this.planForm.value.assigned_to[0].userId,
      dueDate:
        this.planForm.value.dueDate &&
        new Date(this.planForm.value.dueDate).toISOString(),
      sharedDoc_link: this.planForm.value.sharedDoc_link || '',
      status: this.planForm.value.status || PLAN_STATUS.OPEN,
      tag: this.planForm.value.tags.toLowerCase() || '',
      comment: this.planForm.value.comment || '',
      updated_by: this.currentUser.id,
    };
  }

  updatePlan(event) {
    event.preventDefault();
    this.submitted = true;
    console.log('Valid', this.planForm.valid);
    console.log('planForm.value', this.planForm.value);
    if (this.planForm.valid) {
      this.btnDisabled = true;
      this.plansService
        .updatePlan(planHelper.getFormData(this.payload()))
        .then((res: any) => {
          if (res.success) {
            this.reloadPlans = true;
            this.showAlert('success', PLAN_MESSAGES.UPDATE_SUCCESS);
            this.defaultComment = '';
            this.getData();
          } else {
            this.showAlert('error', PLAN_MESSAGES.COMMON_ERROR);
          }
        })
        .catch((err) => {
          this.showAlert('error', PLAN_MESSAGES.COMMON_ERROR);
        })
        .finally(() => {
          this.btnDisabled = false;
          this.submitted = false;
        });
    } else {
      this.submitted = false;
      this.showAlert('error', PLAN_MESSAGES.REQUIRED_ERROR);
    }
  }

  setPermission(plan) {
    this.isEditable =
      plan.status !== PLAN_STATUS.DONE &&
      (plan.assigned_to[0].id === this.currentUser.id ||
        plan.created_by.id === this.currentUser.id);
    this.isOwner = plan.created_by.id === this.currentUser.id;
  }

  showMessage(type = 'error', message = '') {
    this.alert = {
      show: message?.length ? true : false,
      type: type == 'error' ? 'alert-danger' : 'alert-success',
      message: message,
    };
  }

  showAlert(type, message) {
    this.utilityService.alertMessage(type, message);
  }

  closeModal() {
    this.onCloseEvent.emit(this.reloadPlans);
  }
}
