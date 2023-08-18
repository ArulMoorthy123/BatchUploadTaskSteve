import { AppConstServ } from './app-constant.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


//declare let moment :any;
export function convertformatDate(date, databaseFormat = true) {
  if (date) {
    date = date.replace(/\//g, "-");
    let dayPos;
    let yearPos;
    let format
    if (databaseFormat)
      format = AppConstServ.DATE_FORMAT.toLowerCase();
    else
      format = 'YYY-MM-DD'.toLowerCase();

    let yearIndex = format.lastIndexOf('y');
    let dayIndex = format.lastIndexOf('d');
    if (yearIndex == 9)
      yearPos = 2;
    else if (yearIndex == 6)
      yearPos = 1;
    else
      yearPos = 0;

    if (dayIndex == 1)
      dayPos = 0;
    else if (dayPos == 4)
      dayPos = 1;
    else
      dayPos = 2;



    date = date.split('-');
    let i = 0;
    let year;
    let day;
    let month;
    date.forEach(element => {
      if (yearPos == i)
        year = element;
      else if (dayPos == i)
        day = element;
      else
        month = element;
      i++;
    });
    if (databaseFormat)
      return [year, month, day].join('-');
    else
      return [day, month, year].join('-');
  } else
    return null;

}


export function checkInternet() {
  return window.navigator.onLine;
}

export function titleCase(str) {
  return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
}
export function decryptData(data) {
  //if (data.trim() === "" )
  //return;
  //return CryptoJS.AES.decrypt(data.trim(), this.encryptPassword).toString(CryptoJS.enc.Utf8);
  return data;
}

export function encryptData(data) {
  if (data === "")
    return;
  data = data.toString();
  return data;
  //return CryptoJS.AES.encrypt(data, this.encryptPassword).toString();
}

export function isEmailUniqueValidation(control: FormControl): Promise<any> | Observable<any> {
  let regx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  this.emailCheckingloader = false;
  const promise = new Promise<any>((resolve, reject) => {

    if (control.value && control.value.match(regx) !== null) {
      this.emailCheckingloader = true;
      this.userService.validateEmail(control.value).toPromise().then((data: any) => {
        this.emailCheckingloader = false;
        if (data.unique) {
          resolve(null);
        } else {
          resolve({ 'isEmailNotUnique': true });
        }
      }).catch((error: any) => {
        this.emailCheckingloader = false;
        resolve({ 'isEmailNotExist': true });
      });

    } else {
      resolve(null);
    }
  });
  return promise;
}

export function isMobileUniqueValidation(control: FormControl): Promise<any> | Observable<any> {
  let regx = /^([0|\\+[0-9]{1,5})?([1-9][0-9]{9})$/;
  this.mobileCheckingLoader = false;
  const promise = new Promise<any>((resolve, reject) => {
    if (control.value && String(control.value).match(regx) !== null) {
      this.mobileCheckingloading = true;
      this.userService.validateMobile(control.value).toPromise().then((data: any) => {
        this.mobileCheckingLoader = false;
        if (data.unique) {
          resolve(null);
        } else {
          resolve({ 'isMobileNotUnique': true });
        }
      }).catch((error: any) => {
        this.mobileCheckingLoader = false;
        resolve({ 'isMobileNotExist': true });
      });

    } else {
      resolve(null);
    }
  });
  return promise;
}


export function cleanForm(formGroup: FormGroup): any {
  Object.keys(formGroup.controls).forEach((key) => {
    if (formGroup.get(key).value && typeof formGroup.get(key).value == 'string')
      formGroup.get(key).setValue(formGroup.get(key).value.trim());
  });
}

export function stringSearch(data, search) {
  let v = new RegExp(search, "i");
  if (search) {
    return data.match(v);
  }
  return true;
}

export function filterData(filters: any, data: any): any {
  if (!filters)
    return [];
  let keys: any = Object.keys(filters);

  return data.filter(item => {

    return keys.every(key => {
      if (typeof filters[key] !== 'function') return true;
      return filters[key](item[key]);
    });
  });
}

export function getFullUrl(url) {
  return environment.apiurl+url; 
}

 
export function isEmailExistValidation(control: FormControl): Promise<any> | Observable<any> {
  const promise = new Promise<any>((resolve, reject) => {
    this.emailCheckingloader = true;
    this.userService.validateEmail(control.value).toPromise().then((data: any) => {
      this.emailCheckingloader = false;
      if (data.unique) {
        resolve({ 'isEmailNotExist': true });
      } else {
        resolve(null);
      }
    }).catch((error: any) => {
      this.emailCheckingloader = false;
      resolve({ 'isEmailNotExist': true });
    })
  });
  return promise;
}


