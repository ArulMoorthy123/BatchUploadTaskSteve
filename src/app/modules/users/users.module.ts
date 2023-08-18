import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoreModule } from './../core/core.module';

import { LoginComponent } from './components/login/login.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { UpdatePasswordComponent } from './components/update-password/update-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { InviteUserComponent } from './components/invite-user/invite-user.component';
import { UserBasicDetailsComponent } from './components/user-basic-details/user-basic-details.component';
import { UserContactDetailsComponent } from './components/user-contact-details/user-contact-details.component';
import { UserEducationDetailsComponent } from './components/user-education-details/user-education-details.component';
import { UserExperienceDetailsComponent } from './components/user-experience-details/user-experience-details.component';
import { UserSkillDetailsComponent } from './components/user-skill-details/user-skill-details.component';
import { UserSessionComponent } from './components/user-sessions/user-session.component';
import { UserMessageComponent } from './components/user-messages/user-message.component';
import { UserConnectionComponent } from './components/user-connections/user-connection.component';
import { UserGroupComponent } from './components/user-groups/user-group.component';
import { UserViewProfileComponent } from './components/user-view-profile/user-view-profile.component';
import { UserPostComponent } from './components/user-post/user-post.component';
import { ViewUserPostComponent } from './components/view-user-post/view-user-post.component';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import {
  BsDatepickerModule,
  BsDatepickerConfig,
} from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ng2-tooltip-directive';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { SearchFilterPipe } from './helpers/search-filter-pipe';

export function getDatepickerConfig(): BsDatepickerConfig {
  return Object.assign(new BsDatepickerConfig(), {
    dateInputFormat: 'MM-DD-YYYY',
  });
}

@NgModule({
  declarations: [
    LoginComponent,
    ForgotPasswordComponent,
    RegisterComponent,
    ChangePasswordComponent,
    UpdatePasswordComponent,
    UserProfileComponent,
    DashboardComponent,
    InviteUserComponent,
    UserBasicDetailsComponent,
    UserContactDetailsComponent,
    UserEducationDetailsComponent,
    UserExperienceDetailsComponent,
    UserSkillDetailsComponent,
    UserSessionComponent,
    UserMessageComponent,
    UserConnectionComponent,
    UserGroupComponent,
    UserViewProfileComponent,
    UserPostComponent,
    ViewUserPostComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgMultiSelectDropDownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule,
    CarouselModule,
    InfiniteScrollModule,
    CKEditorModule,
    CoreModule,
  ],
  exports: [RegisterComponent, LoginComponent],
  providers: [
    { provide: BsDatepickerConfig, useFactory: getDatepickerConfig },
    SearchFilterPipe,
  ],
})
export class UsersModule {}
