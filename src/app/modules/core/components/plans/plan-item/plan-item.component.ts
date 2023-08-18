import { planHelper } from './../helpers/index';
import { Plans } from '../helpers/plans.dto';
import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { PLAN_FILTER } from '../helpers/plans.constant';

@Component({
  selector: 'app-plan-item',
  templateUrl: './plan-item.component.html',
  styleUrls: ['./plan-item.component.scss'],
})
export class PlanItemComponent implements OnInit {
  @Input() plans: Plans;
  @Input() currentUser;
  @Input() tab: string;
  @Output() onViewPlan = new EventEmitter<string>();
  @Output() deletePlan = new EventEmitter<any>();
  ENABLE_DELETE = planHelper.ENABLE_DELETE;
  PLAN_FILTER = PLAN_FILTER;
  passedDue = false;

  ngOnInit(): void {
    this.passedDue = new Date(this.plans?.dueDate) < new Date();
  }

  viewProfile(id: string) {
    console.log('user', id);
  }

  onDeletePlan() {
    this.deletePlan.emit(this.plans);
  }

  viewPlan(id: string) {
    this.onViewPlan.emit(id);
  }
}
