import _ from 'lodash';
import { planStubs } from './plans.stubs';
import { Validators } from '@angular/forms';
import { AppConstServ } from 'src/app/shared/helper/app-constant.service';

export const planHelper = {
  USE_STUB: false,
  responseTime: 200,
  ENABLE_DELETE: true,

  dropDownConfig: {
    singleSelection: true,
    idField: 'userId',
    textField: 'fullName',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    clearSearchFilter: true,
    enableCheckAll: false,
    maxHeight: 100,
  },

  planFormControls: {
    id: ['', Validators.required],
    title: ['', Validators.required],
    desc: ['', Validators.required],
    dueDate: ['', Validators.required],
    status: ['', Validators.required],
    assigned_to: ['', Validators.required],
    sharedDoc_link: ['',Validators.pattern(AppConstServ.REG_EX.URL)],
    tags: [''],
    comments: [''],
    comment: [''],
    created_on: [''],
    created_by: [''],
    modified_on: [''],
    deleted: [''],
  },

  alertObj: {
    type: '',
    message: '',
    show: false,
  },

  getFormData: (obj) => {
    let formData = new FormData();
    Object.keys(obj).forEach((key) => {
      formData.append(key, obj[key]);
    });
    return formData;
  },

  getPlanById: (id: number, type: string) => {
    return [planStubs[type][id - 1]];
  },

  getStubs: (type: string) => {
    return planStubs[type];
  },

  sortBy: (arrObj, sort, obj) => {
    return _.orderBy(arrObj, [obj], [sort]);
  }
  
};
