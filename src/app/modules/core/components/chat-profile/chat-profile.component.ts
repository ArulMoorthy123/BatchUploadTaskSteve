import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, OnDestroy, TemplateRef } from '@angular/core';
import { QBDialogueService } from '../messenger/qb/services/qbDialogue.service';
import { QBHelperService } from '../messenger/qb/helpers/qbHelper.service';
import { AuthService } from '../../../users/services/auth.service';
import { QBMessageService } from '../messenger/qb/services/qbMessage.service';
import { QBService } from '../messenger/qb/services/qb.service';
import { UtilityService } from '../../../../shared/services/utility.service';
import { QBCONSTAND } from '../../helpers/app.config';
import { Subscription } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-chat-profile',
  templateUrl: './chat-profile.component.html',
  styleUrls: ['./chat-profile.component.scss']
})
export class ChatProfileComponent implements OnInit, OnDestroy {

  self_qbid: number;
  currentDialogueId: any;
  currentDialogue: any;
  groupModal: BsModalRef;
  qbEventSubscription: Subscription;
  modalRef: BsModalRef;
  eventTypeCall;
  eventUserId;
  confirm_message;
  @Output() onCloseEvent = new EventEmitter<boolean>();
  @Output() onClearDialogueEvent = new EventEmitter<boolean>();
  @Input()
  public set dialogueId(dialogueId: any) {
    if (dialogueId) {
      this.self_qbid = this.auth.currentUserValue.qbid;
      this.currentDialogueId = dialogueId;
      this.setDialogue(dialogueId);
    }
  }
  constructor(public qbDialogue: QBDialogueService,
    private qbHelper: QBHelperService,
    private qbService: QBService,
    public auth: AuthService,
    private modalService: BsModalService,
    private ref: ChangeDetectorRef,
    private utilityService: UtilityService,
    public qbMessage: QBMessageService) { }

  ngOnInit(): void {
    this.qbEventSubscription = this.qbService
      .getObserverEvents()
      .subscribe((message: any) => {
        switch (message.type) {
          case 'dialogueListChange':
            if (this.currentDialogueId) {
              this.setDialogue(this.currentDialogueId)
            }
            break;
        }
      });
  }

  openGroupModal(template) {
    this.groupModal = this.modalService.show(template, { class: 'modal-medium' });
  }

  closeGroupModal(e = null) {
    if (this.groupModal) {
      this.groupModal.hide();
    }
    this.ref.detectChanges();
  }


  setDialogue(dialogueId) {
    this.currentDialogue = this.qbDialogue.dialogs[dialogueId] ? this.qbDialogue.dialogs[dialogueId] : null;
  }

  addNewMember() {
    this.qbService.setEvent('OPEN_ADD_NEW_MEMBER_MODAL', this.currentDialogueId, true);
  }

  isAdmin(userid: number = 0) {
    if (userid) {
      return this.currentDialogue.user_id == userid;
    }
    return this.currentDialogue.user_id === this.self_qbid;
  }

  leaveGroup(removeid = null) {
    if (!this.self_qbid) {
      return;
    }
   
    let notification;
    if (removeid) {
      notification = QBCONSTAND.NOTIFICATION_TYPES.REMOVE_DIALOG_BY_SOMEONE;
    } else {
      notification = QBCONSTAND.NOTIFICATION_TYPES.LEAVE_DIALOG;
    }
    let body ="LEFT";
    if(removeid) {
      body = "REMOVED";
    }
    let params = { pull_all: { occupants_ids: [removeid || this.self_qbid] } };
    this.qbHelper.sendMessage(body, this.currentDialogueId, false, notification, [removeid || this.self_qbid]);
    this.qbDialogue.updateDialog(this.currentDialogueId, params, true).then(res => {
      this.utilityService.alertMessage('success', 'User has been removed');
      this.qbService.setEvent("LEAVE_GROUP", this.currentDialogueId, true);
      if (removeid ==null) {
        this.toggleModal(true, true);
      } else {
        this.toggleModal(true, false);
      }
    }).catch(err => {
      this.utilityService.alertMessage('error', 'failed to leave Member');
      this.toggleModal(true, false);
    });
  }

  deleteGroup() {
    if (!this.self_qbid) {
      return;
    }

    if (!this.isAdmin()) {
      return;
    }

    let notification = QBCONSTAND.NOTIFICATION_TYPES.DELETE_GROUP;
    this.qbHelper.sendMessage('DELETE', this.currentDialogueId, false, notification);
    this.qbDialogue.deleteDialog(this.currentDialogueId, true).then(res => {
      this.toggleModal(true, true), //close modal and clear dialogue too 
        this.utilityService.alertMessage('success', 'Group Deleted');
      this.qbService.setEvent("DELETE_GROUP", this.currentDialogueId, true);
      this.ref.detectChanges();
      //let dialogueId = Object.keys(this.qbDialogue.dialogs)[0] || ''; // first dialogue automatically open
      //this.router.navigate([UrlService.USER_PAGE.MESSAGE_URL], { queryParams: { id: dialogueId } })
    }).catch(err => {
      console.log(err, 'error on delete'),
      this.utilityService.alertMessage('error', 'failed to delete group');
      this.toggleModal(true, false);
    });
  }


  openConfirmModal(template: TemplateRef<any>, eventType, userid = 0) {
    this.eventTypeCall = eventType;
    this.eventUserId = userid;
    if (this.eventTypeCall == 'leave') {
      this.confirm_message = "Are you sure to leave this Group ?";
    } else if (eventType == 'delete') {
      this.confirm_message = "Are you sure to Delete this Group ?";
    } else {
      this.confirm_message = "Are you sure Remove user from this Group ?";
    }
    this.modalRef = this.modalService.show(template, { id: 1, class: 'warning_modal' });
  }

  closeConfirmModal() {
    this.modalService.hide(1);
  }

  acceptConfirm() {
    switch (this.eventTypeCall) {
      case "leave":
        this.leaveGroup();
        break;

      case "delete":
        this.deleteGroup();
        break;

      case "remove":
        if (this.eventUserId) {
          this.leaveGroup(this.eventUserId);
        }
        break;
    }
    this.closeConfirmModal();
    this.eventTypeCall = '',
      this.eventUserId = 0;
  }

  toggleModal(status, clearDialogue = false) {
    this.onClearDialogueEvent.emit(clearDialogue);
    this.onCloseEvent.emit(status),
      this.ref.detectChanges();
  }

  ngOnDestroy(): void {
    this.qbEventSubscription.unsubscribe();
  }
}
