import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { chatDateFormatPipe } from './helpers/chatDateFormat.pipe';
import { FilterArrayPipe } from './helpers/filter.pipe';
import { FromNowPipe } from './helpers/from-now.pipe';
import { MessengerComponent } from './components/messenger/messenger.component';
import { ReactiveFormsModule } from '@angular/forms';
import { QBComponent } from './components/messenger/qb/qb.component';
import { MesiboComponent } from './components/messenger/mesibo/mesibo.component';
import { ConferenceRoomComponent } from './components/conference-room/conference-room.component';
import { MessageContainnerComponent } from './components/message-containner/message-containner.component';
import { MessagesComponent } from './components/messages/messages.component';
import { DialogueListComponent } from './components/dialogue-list/dialogue-list.component';
import { RouterModule } from '@angular/router';
import { ConnectionListComponent } from './components/connection-list/connection-list.component';
import { GroupCreationComponent } from './components/group-creation/group-creation.component';
import { FilterChatComponent } from './components/filter-chat/filter-chat.component';
import { ChatProfileComponent } from './components/chat-profile/chat-profile.component';
import { UpdateGroupInfoComponent } from './components/update-group-info/update-group-info.component';
import { ChatNotificationPipe } from './helpers/chat-notification.pipe';
import { ChatProfileNamePipe } from './helpers/pipe/chat-profile-name.pipe';
import { UserProfileImagePipe } from './helpers/pipe/user-profile-image.pipe';
import { ChatMessageStatusPipe } from './helpers/pipe/chat-message-status.pipe';
import { ChatProfileImagePipe } from './helpers/pipe/chat-profile-image.pipe';
import { LazyLoadImageDirective } from './helpers/directives/lazy-load-image.directive';
import { ChatFileUrlPipe } from './helpers/pipe/chat-file-url.pipe';
import { SAVER, getSaver } from './helpers/download/saver.provider';
import { PrivateCallComponent } from './components/private-call/private-call.component';
import { secToTimePipe } from './helpers/pipe/call-timer-sec';
import { splitPipe } from './helpers/pipe/split.pipe';
import { ReadReportDirective } from './helpers/directives/read-report.directive';
import { DialogueNotificationPipe } from './helpers/pipe/dialog-notification.pipe';
import { ScrollTopTrackerDirective } from './helpers/directives/scroll-top-tracker.directive';
import { PlansComponent } from './components/plans/plans.component';
import { PlanItemComponent } from './components/plans/plan-item/plan-item.component';
import { PlanDetailsComponent } from './components/plans/plan-details/plan-details.component';
import { PlanAddComponent } from './components/plans/plan-add/plan-add.component';
import { PlanWidgetComponent } from './components/plans/plan-widget/plan-widget.component';

import { SessionAddComponent } from './components/session/session-add/session-add.component';
import { SessionComponent } from './components/session/session.component';
import { SessionDetailsComponent } from './components/session/session-details/session-details.component';
import { SessionItemComponent } from './components/session/session-item/session-item.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { BsDatepickerModule, BsDatepickerConfig, } from 'ngx-bootstrap/datepicker';
import { MesiboMessengerComponent } from './components/messenger/mesibo/mesibo-messenger/mesibo-messenger.component';

export function getDatepickerConfig(): BsDatepickerConfig {
  return Object.assign(new BsDatepickerConfig(), {
    dateInputFormat: 'MM-DD-YYYY',
  });
}

@NgModule({
  declarations: [
    MessengerComponent,
    FilterArrayPipe,
    FromNowPipe,
    QBComponent,
    MesiboComponent,
    ConferenceRoomComponent,
    MessageContainnerComponent,
    chatDateFormatPipe,
    MessagesComponent,
    DialogueListComponent,
    ConnectionListComponent,
    GroupCreationComponent,
    FilterChatComponent,
    ChatProfileComponent,
    UpdateGroupInfoComponent,
    ChatNotificationPipe,
    ChatProfileNamePipe,
    ChatMessageStatusPipe,
    ChatProfileImagePipe,
    LazyLoadImageDirective,
    ChatFileUrlPipe,
    PrivateCallComponent,
    secToTimePipe,
    splitPipe,
    ReadReportDirective,
    DialogueNotificationPipe,
    ScrollTopTrackerDirective,
    PlansComponent,
    PlanItemComponent,
    PlanDetailsComponent,
    PlanAddComponent,
    PlanWidgetComponent,
    SessionAddComponent,
    SessionComponent,
    SessionDetailsComponent,
    SessionItemComponent,
    MesiboMessengerComponent,
    UserProfileImagePipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CollapseModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    AccordionModule.forRoot(),
    TooltipModule.forRoot(),
  ],
  exports: [MessengerComponent, chatDateFormatPipe, PlanWidgetComponent],
  providers: [
    { provide: SAVER, useFactory: getSaver },
    { provide: BsDatepickerConfig, useFactory: getDatepickerConfig },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class CoreModule {}
