import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { QBService } from '../../../modules/core/components/messenger/qb/services/qb.service';
import { UrlService } from '../../services/url.service';
import { AuthService } from '../../../modules/users/services/auth.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../modules/core/mesibo/providers/chat.service';
import { QBDialogueService } from 'src/app/modules/core/components/messenger/qb/services/qbDialogue.service';
import { QBMessageService } from 'src/app/modules/core/components/messenger/qb/services/qbMessage.service';
declare const QB: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  //navDefault = ['ABOUT', 'CONTACT'];
  navDefault = ['ABOUT'];
  navAuth = ['DASHBOARD', 'CONNECTION', 'MESSAGE', 'SESSION', 'PLANS'];

  loginForm: FormGroup;
  routerSub: Subscription;
  urlServices = UrlService;
  submitted = false;
  loginModalOpen = false;
  navMobileOpen = false;
  env = environment;
  constructor(private router: Router,
    public auth: AuthService,
    private qbDialog :QBDialogueService,
    private qbMessage :QBMessageService,
    private mesiboService: ChatService,
    public qbService: QBService)
    {
    this.routerSub = this.router.events.subscribe((val) => {
      if (this.loginModalOpen) this.toggleLoginModel();
      if (this.navMobileOpen) this.toggleNavMobile();
    });
  }

  ngOnInit(): void {
    this.initVariable();
  }
  closeLoginModal(){
    this.loginModalOpen = false;
    let ele = document.getElementsByTagName('body')[0];
    ele.classList.remove('loginOpen');
  }
  toggleLoginModel() {
    let ele = document.getElementsByTagName('body')[0];
    ele.classList.toggle('loginOpen');
    this.loginModalOpen = !this.loginModalOpen;
  }

  logout() {
    this.qbService.destroySession();
    this.qbDialog.dialogs={}; // empty all dialogs
    this.qbMessage.dialogueMessage={}; // empty all dialogs Message
    this.qbDialog.currentDialogue={}; // empty all dialogs Message
    this.mesiboService.logout();
    this.auth.logout();
  }

  toggleNavMobile() {
    this.navMobileOpen = !this.navMobileOpen;
  }

  initVariable() {
    this.submitted = false;
    this.loginModalOpen = false;
  }

  ngOnDestroy() {
    this.initVariable();
    this.routerSub.unsubscribe();
  }
}
