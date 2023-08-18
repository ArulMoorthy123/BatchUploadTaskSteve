import { Component, OnInit, OnDestroy, Input, EventEmitter, Output, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { QBService } from '../messenger/qb/services/qb.service';
import { AuthService } from '../../../users/services/auth.service';
import { QBCONSTAND } from '../../helpers/app.config';
import { QBDialogueService } from '../messenger/qb/services/qbDialogue.service';
import { QBHelperService } from '../messenger/qb/helpers/qbHelper.service';
import { UtilityService } from '../../../../shared/services/utility.service';
import { CoreService } from '../../services/core.service';

@Component({
  selector: 'app-group-creation',
  templateUrl: './group-creation.component.html',
  styleUrls: ['./group-creation.component.scss']
})
export class GroupCreationComponent implements OnInit, OnDestroy {

  groupForm: FormGroup;
  contacts: any = [];
  filterContacts: any[];
  loader: boolean = false;
  action: string;
  loaderContent: boolean = false;
  submitted: boolean = false;
  @Output() onCloseEvent = new EventEmitter<any>();

  @Input()
  public set type(type: string) {
    if (type) {
      this.action = type;
    }
  }
  currentDialogueId;
  @Input()
  public set dialogueId(dialogueId: any) {
    if (dialogueId) {
      this.currentDialogueId = dialogueId,
        this.addCheckboxes();
    }
  }

  constructor(private qbService: QBService,
    private qbdialogue: QBDialogueService,
    private qbHelper: QBHelperService,
    public ref: ChangeDetectorRef,
    private coreService: CoreService,
    private utilityService: UtilityService,
    private auth: AuthService) { }

  ngOnInit(): void {
    this.initForm(),
      this.getConnectionList();
  }

  initForm() {
    this.groupForm = new FormGroup({
      search: new FormControl(null),
      groupname: new FormControl(null, [Validators.required]),
      contactlist: new FormArray([], [Validators.required]),
    });

    // this.groupForm.get('contactlist').valueChanges
    //   .subscribe((term: FormGroup) => {
    //     // This is bad. Only the first search input will filter through the sub accounts.
    //     console.log('serach', term);
    //     this.searchTerm = term[0];
    //   });

    this.loader = false;
  }

  getConnectionList() {
    this.loaderContent = true;
    this.coreService.getConnectionList().then(res => {
      this.addCheckboxes();
      this.loaderContent = false;
    }).catch(err => {
      this.loaderContent = false;
      this.utilityService.alertMessage('error', 'connection list fetching error');
    });
  }

  get formData() {
    return <FormArray>this.groupForm.get('contactlist');
  }

  private addCheckboxes() {
    this.initForm(),
      this.filterContacts = [],
      (this.groupForm.controls['contactlist'] as FormArray).clear();
    let userId = this.auth.currentUserValue ? this.auth.currentUserValue.qbid : null;
    this.contacts = [];
    let listContact: any = Object.values(this.qbService.contactList);
    listContact.forEach((o, i) => {
      if (o.qbid != userId) {
        if (this.action == 'addNewMember') {
          //console.log('data get groip mem', this.getGroupMember(), this.getGroupMember().includes(parseInt(o.qbid)), o.qbid);
          if (this.getGroupMember().includes(parseInt(o.qbid))) {
            //console.log('skip the loop',  this.getGroupMember().includes(o.qbid));
            return;
          }
        }
        this.contacts.push(o);
        this.filterContacts.push(o);
        //const control = new FormControl({qbid:o.qbid,name : o.firstName}); // if first item set to true, else false
        //(this.groupForm.controls.contactlist as FormArray).push(control);
      }
    });
  }

  onCheckboxChange(e) {
    const checkArray: FormArray = this.groupForm.get('contactlist') as FormArray;
    if (e.target.checked) {
      checkArray.push(new FormControl(e.target.value));
    } else {
      let i: number = 0;
      checkArray.controls.forEach((item: FormControl) => {
        if (item.value == e.target.value) {
          checkArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }


  getGroupMember() {
    if (!this.currentDialogueId) {
      return [];
    }
    return this.qbdialogue.dialogs[this.currentDialogueId].occupants_ids.filter(a => a != this.auth.currentUserValue.qbid);
  }

  getSelectedId() {
    let contactList = this.groupForm.value.contactlist;
    return contactList.map(a => parseInt(a));
    //return this.groupForm.value.contactlist;
    //.map((v, i) => (v ? parseInt(this.contacts[i].qbid) : null))
    //.filter((v) => v !== null);
  }

  createNewChat() {
    this.submitted = true;
    let selectedOrderIds: any = this.getSelectedId();
    selectedOrderIds.push(this.qbService.qbSession.user_id);
    selectedOrderIds = selectedOrderIds.map(a => parseInt(a));

    if (selectedOrderIds.length == 1 || !this.groupForm.valid) {
      return false;
    }
    let type = QBCONSTAND.DIALOG_TYPES.GROUPCHAT

    let params: any = {
      type: type,
      occupants_ids: selectedOrderIds,
      data: {
        class_name: 'dialogue_info',
        description: '',
        mid: 0
      }
    };
    this.loader = true;
    let messageBody = 'Hi Everyone';
    params.name = this.groupForm.value.groupname;
    this.qbdialogue.createDialog(params).then((dialog) => {
      this.qbHelper.sendMessage(
        messageBody,
        dialog._id,
        false,
        QBCONSTAND.NOTIFICATION_TYPES.NEW_DIALOG,
        selectedOrderIds
      ),
        this.qbHelper.notifyAboutState(
          QBCONSTAND.NOTIFICATION_TYPES.NEW_DIALOG,
          messageBody,
          dialog._id
        ),
        this.utilityService.alertMessage('success', 'New Group Created');
        this.loader = false;
      this.initForm();
      this.closeModal();
    }).catch(err => {
      this.utilityService.alertMessage('error', 'failed on group creation');
      this.closeModal();
    });

  }

  addNewMember() {
    this.submitted = true;
    const selectedOrderIds: any = this.getSelectedId();
    if (selectedOrderIds.length == 0) {
      return false;
    }
    let params = { push_all: { occupants_ids: selectedOrderIds } };
    let messageBody = 'ADD_NEW_MEMBER';
    let dialog_id = this.dialogueId || this.qbdialogue.currentDialogue._id;
    this.loader = true;
    this.qbdialogue.updateDialog(dialog_id, params).then((dialog) => {
      this.qbHelper.sendMessage(
        messageBody,
        dialog._id,
        false,
        QBCONSTAND.NOTIFICATION_TYPES.ADD_NEW_USER_DIALOG,
        selectedOrderIds
      ),
        this.qbHelper.notifyAboutState(
          QBCONSTAND.NOTIFICATION_TYPES.ADD_NEW_USER_DIALOG,
          messageBody,
          dialog._id
        ),
        this.loader = false;
      this.initForm();
      this.closeModal();
    }).catch(err => {
      this.utilityService.alertMessage('error', 'failed to add member');
      this.closeModal();
    });
  }

  closeModal() {
    this.submitted = false;
    this.onCloseEvent.emit('close');
  }

  ngOnDestroy(): void {
    this.initForm();
    this.submitted = false;
  }


}
