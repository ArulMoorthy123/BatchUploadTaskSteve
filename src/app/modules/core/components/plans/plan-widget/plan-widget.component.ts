import { PLAN_TABS } from './../helpers/plans.constant';
import { Component, Input, OnInit } from '@angular/core';
import { PlansService } from '../plans.service';
import { UrlService } from 'src/app/shared/services/url.service';
import { planHelper } from '../helpers';

@Component({
  selector: 'app-plan-widget',
  templateUrl: './plan-widget.component.html',
  styleUrls: ['./plan-widget.component.scss'],
})
export class PlanWidgetComponent implements OnInit {
  @Input() currentUser;
  @Input() connectionList;
  planList;
  type = PLAN_TABS[0].uri;
  urlServices = UrlService;

  constructor(private plansService: PlansService) {}

  ngOnInit(): void {
    this.getPlanList();
  }
  
  async getPlanList() {
    await this.plansService
      .getPlansByType(this.type, this.currentUser.id)
      .then((res) => {
        this.planList = res ? planHelper.sortBy(res, 'asc', 'dueDate') : [];
      })
      .catch((e) => {});
    return true;
  }
}
