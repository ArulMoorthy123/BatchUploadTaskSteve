import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultComponent } from './layouts/default/default.component';
import { HomeComponent } from './modules/home/home.component';
import { TermsComponent } from './shared/components/terms/terms.component';
import { PrivacyPolicyComponent } from './shared/components/privacy-policy/privacy-policy.component';
import { ContactComponent } from './shared/components/contact/contact.component';
import { AboutComponent } from './shared/components/about/about.component';

import { DashboardComponent } from './modules/users/components/dashboard/dashboard.component';
import { UserSessionComponent } from './modules/users/components/user-sessions/user-session.component';
import { AuthGuard, LoginCheckGuard } from './auth.guard';

import { UserViewProfileComponent } from './modules/users/components/user-view-profile/user-view-profile.component';
import { UserPostComponent } from './modules/users/components/user-post/user-post.component';
import { ViewUserPostComponent } from './modules/users/components/view-user-post/view-user-post.component';

import { UserProfileComponent } from './modules/users/components/user-profile/user-profile.component';
import { ForgotPasswordComponent } from './modules/users/components/forgot-password/forgot-password.component';
import { RegisterComponent } from './modules/users/components/register/register.component';
import { LoginComponent } from './modules/users/components/login/login.component';
import { ChangePasswordComponent } from './modules/users/components/change-password/change-password.component';
import { UpdatePasswordComponent } from './modules/users/components/update-password/update-password.component';

import { UserGroupComponent } from './modules/users/components/user-groups/user-group.component';
import { UserConnectionComponent } from './modules/users/components/user-connections/user-connection.component';
import { PlansComponent } from './modules/core/components/plans/plans.component';

import { ConferenceRoomComponent } from './modules/core/components/conference-room/conference-room.component';
import { MessagesComponent } from './modules/core/components/messages/messages.component';
import { PagenotfoundComponent } from './shared/components/pagenotfound/pagenotfound/pagenotfound.component';
import { WipComponent } from './shared/components/wip/wip.component';

import { UrlService } from './shared/services/url.service';
import { AppConstServ } from './shared/helper/app-constant.service';
import { SessionComponent } from './modules/core/components/session/session.component';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        data: {
          title: 'Home',
          description: 'Description about Career Journey',
        },
        canActivate: [LoginCheckGuard],
      },
      {
        path: UrlService.PUBLIC_PAGE.ABOUT_URL.split(/[/]+/).pop(),
        component: AboutComponent,
        data: {
          title: 'About Us',
          description: 'Description about Career Journey',
        },
      },
      {
        path: UrlService.PUBLIC_PAGE.CONTACT_URL.split(/[/]+/).pop(),
        component: ContactComponent,
        data: {
          title: 'Contact',
          description: 'Description about Career Journey',
        },
      },
      {
        path: UrlService.PUBLIC_PAGE.PRIVACY_URL.split(/[/]+/).pop(),
        component: PrivacyPolicyComponent,
        data: {
          title: 'Privacy Policy',
          description: 'Description about Career Journey',
        },
      },
      {
        path: UrlService.PUBLIC_PAGE.TERMS_URL.split(/[/]+/).pop(),
        component: TermsComponent,
        data: {
          title: 'Terms & Conditions',
          description: 'Description about Career Journey',
        },
      },
      //{ path: 'user', loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule)}
      {
        path: UrlService.USER_PAGE.LOGIN_URL.split(/[/]+/).pop(),
        component: LoginComponent,
        data: {
          title: 'Login',
          description: 'Description about Career Journey',
        },
      },
      {
        path: UrlService.USER_PAGE.REGISTER_URL.split(/[/]+/).pop(),
        component: RegisterComponent,
        data: {
          title: 'Registration',
          description: 'Description about Career Journey',
        },
      },
      {
        path: UrlService.USER_PAGE.FORGOT_PASSWORD_URL.split(/[/]+/).pop(),
        component: ForgotPasswordComponent,
        data: {
          title: 'Forgot Password',
          description: 'Description about Career Journey',
        },
      },
      {
        path: UrlService.USER_PAGE.RESET_PASSWORD_URL.split(/[/]+/).pop(),
        component: ChangePasswordComponent,
        data: {
          title: 'Change Password',
          description: 'Description about Career Journey',
        },
      },
      {
        path: UrlService.USER_PAGE.UPDATE_PASSWORD_URL.split(/[/]+/).pop(),
        component: UpdatePasswordComponent,
        data: {
          title: 'Update Password',
          description: 'Description about Career Journey',
        },
      },
      {
        path: UrlService.USER_PAGE.PROFILE_URL.split(/[/]+/).pop(),
        component: UserProfileComponent,
        data: {
          title: 'My Profile',
          description: 'Description about Career Journey',
        },
        canActivate: [AuthGuard],
      },
      {
        path: UrlService.USER_PAGE.DASHBOARD_URL.split(/[/]+/).pop(),
        component: DashboardComponent,
        data: {
          title: 'Home',
          description: 'Description about Career Journey',
        },
        canActivate: [AuthGuard],
      },
      {
        path:
          UrlService.USER_PAGE.SESSION_URL.split(/[/]+/).pop() + '/:sessionId',
        component: SessionComponent,
        data: {
          title: AppConstServ.URL_OBJ.SESSION.title,
          description: AppConstServ.URL_OBJ.SESSION.desc,
        },
      },
      {
        path: UrlService.USER_PAGE.SESSION_URL.split(/[/]+/).pop(),
        component: SessionComponent,
        data: {
          title: 'Session',
          description: 'Description about User Session',
        },
        // canActivate: [AuthGuard],
      },
      {
        path: UrlService.USER_PAGE.MESSAGE_URL.split(/[/]+/).pop(),
        component: MessagesComponent,
        data: {
          title: 'Message',
          description: 'Description about User Message',
        },
        canActivate: [AuthGuard],
      },
      {
        path: UrlService.USER_PAGE.CONNECTION_URL.split(/[/]+/).pop(),
        component: UserConnectionComponent,
        data: {
          title: 'Connection',
          description: 'Description about User Connection',
        },
        canActivate: [AuthGuard],
      },
      {
        path: UrlService.USER_PAGE.GROUP_URL.split(/[/]+/).pop(),
        component: UserGroupComponent,
        data: {
          title: 'Group',
          description: 'Description about User Group',
        },
        canActivate: [AuthGuard],
      },
      {
        path: UrlService.USER_PAGE.VIEW_PROFILE_URL.split(/[/]+/).pop(),
        component: UserViewProfileComponent,
        data: {
          title: 'View Profile',
          description: 'Description about User profile',
        },
        canActivate: [AuthGuard],
      },
      {
        path: UrlService.USER_PAGE.USER_POST_URL.split(/[/]+/).pop(),
        component: UserPostComponent,
        data: {
          title: 'List Post',
          description: 'Description about List Post',
        },
        canActivate: [AuthGuard],
      },
      {
        path: UrlService.USER_PAGE.VIEW_USER_POST_URL.split(/[/]+/).pop(),
        component: ViewUserPostComponent,
        data: {
          title: 'View Post',
          description: 'Description about User post',
        },
        canActivate: [AuthGuard],
      },
      {
        path: UrlService.USER_PAGE.PLANS_URL.split(/[/]+/).pop() + '/:taskId',
        component: PlansComponent,
        data: {
          title: AppConstServ.URL_OBJ.PLANS.title,
          description: AppConstServ.URL_OBJ.PLANS.desc,
        },
      },
      {
        path: UrlService.USER_PAGE.PLANS_URL.split(/[/]+/).pop(),
        component: PlansComponent,
        data: {
          title: AppConstServ.URL_OBJ.PLANS.title,
          description: AppConstServ.URL_OBJ.PLANS.desc,
        },
      },
    ],
  },
  {
    path: UrlService.USER_PAGE.CONFERENCE_URL.split(/[/]+/).pop(),
    component: ConferenceRoomComponent,
    data: {
      title: 'Conference Call',
      description: 'Conference Room Description',
    },
  },

  {
    path: UrlService.USER_PAGE.PAGENOTFOUND_URL.split(/[/]+/).pop(),
    component: PagenotfoundComponent,
    data: {
      title: 'pagenotfound',
      description: 'pagenotfound',
    },
  },

  { path: '**', redirectTo: UrlService.USER_PAGE.PAGENOTFOUND_URL },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
