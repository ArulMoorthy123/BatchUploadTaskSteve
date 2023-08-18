import { Injectable } from '@angular/core';
import { AppConstServ } from '../helper/app-constant.service';

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  public static USER_MODULE = 'users';
  public static urlObj = AppConstServ.URL_OBJ;
  public static USER_PAGE = {
    //USER_ROUTE :
    LOGIN_URL: AppConstServ.URL_OBJ.LOGIN.url,
    FORGOT_PASSWORD_URL: AppConstServ.URL_OBJ.FORGOT_PASSWORD.url,
    RESET_PASSWORD_URL: AppConstServ.URL_OBJ.RESET_PASSWORD.url,
    UPDATE_PASSWORD_URL: AppConstServ.URL_OBJ.UPDATE_PASSWORD.url,
    DASHBOARD_URL: AppConstServ.URL_OBJ.DASHBOARD.url,
    PROFILE_URL: AppConstServ.URL_OBJ.PROFILE.url,
    REGISTER_URL: AppConstServ.URL_OBJ.REGISTER.url,
    SESSION_URL: AppConstServ.URL_OBJ.SESSION.url,
    MESSAGE_URL: AppConstServ.URL_OBJ.MESSAGE.url,
    CONNECTION_URL: AppConstServ.URL_OBJ.CONNECTION.url,
    GROUP_URL: AppConstServ.URL_OBJ.GROUP.url,
    CONFERENCE_URL: AppConstServ.URL_OBJ.CONFERENCE.url,
    VIDEO_CALL_URL: AppConstServ.URL_OBJ.VIDEO_CALL.url,
    VIEW_PROFILE_URL: AppConstServ.URL_OBJ.VIEW_PROFILE.url,
    USER_POST_URL: AppConstServ.URL_OBJ.USER_POST.url,
    VIEW_USER_POST_URL: AppConstServ.URL_OBJ.VIEW_USER_POST.url,
    PLANS_URL: AppConstServ.URL_OBJ.PLANS.url,
    PAGENOTFOUND_URL:AppConstServ.URL_OBJ.PAGENOTFOUND.url,
  };

  public static PUBLIC_PAGE = {
    HOME_URL: AppConstServ.URL_OBJ.HOME.url,
    ABOUT_URL: AppConstServ.URL_OBJ.ABOUT.url,
    CONTACT_URL: AppConstServ.URL_OBJ.CONTACT.url,
    PRIVACY_URL: AppConstServ.URL_OBJ.PRIVACY.url,
    TERMS_URL: AppConstServ.URL_OBJ.TERMS.url,
  };

  constructor() {}
}
