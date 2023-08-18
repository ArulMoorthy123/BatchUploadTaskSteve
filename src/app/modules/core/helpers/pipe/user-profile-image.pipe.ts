import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { AppConstServ } from '../../../../shared/helper/app-constant.service';

@Pipe({
  name: 'userProfileImage',
})
export class UserProfileImagePipe implements PipeTransform {
  constructor() { }

  transform(user: any, args?: any): any {
    if (user) {
      return environment.apiurl + user;
    }
    return AppConstServ.DEFAULT_PROFILE_URL
  }

}
