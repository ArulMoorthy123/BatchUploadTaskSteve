import { Component, OnInit, OnDestroy, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { QBDialogueService } from '../messenger/qb/services/qbDialogue.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UrlService } from '../../../../shared/services/url.service';
import { QBService } from '../messenger/qb/services/qb.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { QB_CONNECTION_STATUS } from '../../helpers/app.config';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  dialogueId: any;
  paramsSubscription: Subscription;
  fragmentSubscription: Subscription;
  activeTab = 'chat';
  searchForm: FormGroup;
  groupModal: BsModalRef;
  qbEventSubscription: Subscription;
  type = 'newGroup'
  dialogueId_Panel;
  urlServices = UrlService;
  loading: boolean = false;
  @ViewChild('groupMemberTemplate') groupMemberTemplate;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private qbService: QBService,
    private dialogueService: QBDialogueService,
    public ref: ChangeDetectorRef,
    private modalService: BsModalService,
    private qbdialogue: QBDialogueService) { }

  ngOnInit(): void {
    this.initForm(),
      this.paramsSubscription = this.route.queryParams.subscribe(params => {
        if (this.dialogueId != params['id']) {
          this.onSelectDialogue();
        }
        if (params['qid']) {
          this.createChat(params['qid']);
        }

        this.dialogueId = params['id'] ? params['id'] : null;
        // redirect if dialogs id wrong
        if (this.dialogueId && !this.qbdialogue.checkDialogueExists(this.dialogueId)) {
          this.router.navigate([UrlService.USER_PAGE.MESSAGE_URL]);
        }

      });

    this.fragmentSubscription = this.route.fragment.subscribe(res => {
      if (res) {
        this.activeTab = res;
      }
    });

    this.qbEventSubscription = this.qbService
      .getObserverEvents()
      .subscribe((message: any) => {
        switch (message.type) {
          case 'OPEN_ADD_NEW_MEMBER_MODAL':
            this.type = 'addNewMember';
            this.dialogueId_Panel = message.data;
            this.openGroupModal('addNewMember');
            break;
        }
      });
  }

  get getQBStatus() {
    let status = this.qbService.getConnectionStatus();
    this.loading = status == QB_CONNECTION_STATUS.CONNECTED ? false : true;
    return status;
  }

  initForm() {
    this.searchForm = new FormGroup({
      searchinput: new FormControl(null)
    });
  }
  // on select dialogue by user 
  onSelectDialogue() {
    if (!this.dialogueId)
      return;
    // console.log('select current dialogue ', this.qbdialogue.dialogs[this.dialogueId], this.dialogueId)
    //check dialogue already have on list
    if (this.qbdialogue.checkDialogueExists(this.dialogueId)) {
      this.router.navigate([UrlService.USER_PAGE.MESSAGE_URL], { fragment: 'chat' })
      this.qbdialogue.setCurrentDialogue(this.dialogueId);
    } else {
      return false;
    }
  }

  async createChat(qid) {
    //open message window for the contact
    if (!qid) {
      return;
    }
    if (qid) {
      let param = {
        'type': 3,
        'occupants_ids': parseInt(qid)
      };
      this.dialogueService.createDialog(param).then(res => {
        this.onUserSelect(res._id);
      });
    }
  }

  openGroupModal(e) {
    if (e == 'new') {
      this.type = 'newGroup';
    } else {
      this.type = e;
    }
    this.groupModal = this.modalService.show(this.groupMemberTemplate, { class: 'modal-medium' });
  }

  closeGroupModal(event) {
    if (this.groupModal) {
      this.groupModal.hide();
    }
    this.type = 'newGroup';
    this.dialogueId_Panel = this.dialogueId;
  }

  onUserSelect(event) {
    if (event) {
      this.dialogueId = event,
        this.ref.detectChanges(),
        this.onSelectDialogue();
    }
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
    this.fragmentSubscription.unsubscribe();
    this.initForm();
    this.qbEventSubscription.unsubscribe();
  }
}
