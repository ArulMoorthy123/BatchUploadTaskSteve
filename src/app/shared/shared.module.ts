import { RouterModule } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsComponent } from './components/terms/terms.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersModule } from '../modules/users/users.module';
import { ClickOutsideDirective } from './directive/clickoutside.directive';

import { AutoLogoutService } from '../shared/services/auto-logout.service';
import { AutoLogoutComponent } from '../shared/components/autologout/auto-logout.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound/pagenotfound.component';
import { WipComponent } from './components/wip/wip.component';
import { ConfirmBoxComponent } from './components/confirm-box/confirm-box.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    TermsComponent,
    AboutComponent,
    ContactComponent,
    PrivacyPolicyComponent,
    ClickOutsideDirective,
    AutoLogoutComponent,
    PagenotfoundComponent,
    WipComponent,
    ConfirmBoxComponent    
  ],
  imports: [CommonModule, RouterModule,ReactiveFormsModule,UsersModule],
  exports: [
    HeaderComponent,
    FooterComponent,
    TermsComponent,
    AboutComponent,
    ContactComponent,
    PrivacyPolicyComponent,
    ClickOutsideDirective,
    ConfirmBoxComponent
  ],
  providers: [
    AutoLogoutService
  ]
})
export class SharedModule {}
