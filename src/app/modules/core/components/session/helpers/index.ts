import { SORT, SESSION_STATUS, SESSION_LIST } from './session.constant';
import _ from 'lodash';
import * as moment from 'moment';

let yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

export const sessionHelper = {
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

  alertObj: {
    type: '',
    message: '',
    show: false,
  },

  formatData: (data) => {
    let myList = { CANCELED: [], ACTIVE: [], ARCHIVE: [] };
    data.filter((obj) => {
      let starts = new Date(obj[SORT.BY]);
      if (obj.status.trim() === SESSION_STATUS.CANCELED) {
        myList.CANCELED.push(obj);
      } else if (starts > yesterday) {
        myList.ACTIVE.push(obj);
      } else if (starts < yesterday) {
        myList.ARCHIVE.push(obj);
      }
    });
    return myList;
  },
  dtForInput(d) {
    // return d.slice(0, 16);
    return moment.utc(d).format('YYYY-MM-DDTHH:mm');
  },
};

export function sortBy(data, dir = SORT.ASC, by = SORT.BY) {
  const result =
    dir === SORT.ASC
      ? data.sort((a, b) => (a[by] > b[by] ? 1 : -1))
      : data.sort((a, b) => (a[by] > b[by] ? -1 : 1));
  return result;
}
