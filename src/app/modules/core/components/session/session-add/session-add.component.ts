import { TIMEZONE } from './../helpers/session.constant';
import { KeyValue } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/modules/users/services/auth.service';
import { AppConstServ } from 'src/app/shared/helper/app-constant.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import {
  getTimeZoneData, utcDateConversion
} from '../../../../../shared/helper/timezone-utility';
import { ChatService } from '../../../mesibo/providers/chat.service';
import { planHelper } from '../../plans/helpers';
import { PlansService } from '../../plans/plans.service';
import {
  SESSION_MESSAGES,
  SESSION_STATUS,
  SESSION_TIME,
} from '../helpers/session.constant';
import { Session } from '../helpers/session.dto';
import { SessionService } from '../session.service';
import { sessionHelper } from '../helpers';
@Component({
  selector: 'app-session-add',
  templateUrl: './session-add.component.html',
})
export class SessionAddComponent implements OnInit {
  @Output() onCloseEvent = new EventEmitter<boolean>();
  sessionForm: FormGroup;
  submitted: boolean = false;
  minDate = sessionHelper.dtForInput(new Date().toISOString());
  validTime = false;
  REG_EX = AppConstServ.REG_EX;
  SESSION_TIME = SESSION_TIME;
  timeZoneData = getTimeZoneData();
  minTimeZone = TIMEZONE;
  currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  contactList;
  currentUser: any = this.auth.getUserDetails();
  loading: boolean = false;
  dropdownSettings: any = {};
  sessionId;
  sessionDetails: Session;
  updateDropdown = true;
  constructor(
    private _bsModalRef: BsModalRef,
    private auth: AuthService,
    private utilityService: UtilityService,
    private sessionService: SessionService,
    private chatService: ChatService,
    private ref: ChangeDetectorRef,
    private plansService: PlansService
  ) {}

  ngOnInit(): void {
    this.dropdownSettings = { ...planHelper.dropDownConfig };
    this.dropdownSettings.singleSelection = false;
    (this.currentUser = this.auth.getUserDetails()), this.getContactList();
    this.initSessionForm();
  }

  originalOrder = (
    a: KeyValue<number, string>,
    b: KeyValue<number, string>
  ): number => {
    return 0;
  };

  isValidTime(event) {
    this.validTime = event;
  }

  assignSessionId(id) {
    this.sessionId = id;
  }

  getSessionById(id) {
    if (id) {
      this.sessionService
        .getSessionById(id)
        .then((res: any) => {
          if (res.error) {
            this.sessionDetails = null;
          } else {
            this.sessionDetails = res[0];
            this.sessionDetails.members.map((a) => {
              a.userId = a.id;
              a.fullName = a.name;
            });
            this.sessionDetails.members = this.sessionDetails.members.filter(
              (a) => a.id != this.auth.currentUserValue.id
            );
            this.updateFormValue(), this.ref.detectChanges();
          }
        })
        .catch((error) => {
          this.showMessage(false);
        });
    }
  }

  updateFormValue() {
    this.updateDropdown = false;
    this.ref.detectChanges();
    if (this.sessionDetails) {
      this.sessionForm.patchValue(this.sessionDetails);
      this.sessionForm.patchValue({
        invites: this.sessionDetails.members,
        sessionDate: sessionHelper.dtForInput(this.sessionDetails.starts)
      });
      this.updateDropdown = true;
      this.ref.detectChanges();
    }
  }

  getContactList() {
    this.plansService
      .getConnections(this.currentUser.emailId)
      .then((result) => {
        this.contactList = result ? result : [];
      })
      .catch((err) => {
        this.contactList = [];
      });
  }

  initSessionForm() {
    this.sessionForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      invites: new FormControl(null, [Validators.required]),
      sessionDate: new FormControl(null, [Validators.required]),
      duration: new FormControl(30, [Validators.required]),
      desc: new FormControl('', [Validators.required]),
      timeZone: new FormControl(this.currentTimeZone, [Validators.required]),
    });
  }

  getApiPayload() {
    let apiPayLoad: any = {};
    let formData = new FormData();
    let member = this.sessionForm.value.invites || [];
    apiPayLoad.members = [];
    member.map((a) => apiPayLoad.members.push(a.userId));
    apiPayLoad.title = this.sessionForm.value.title.trim() || '';
    apiPayLoad.desc = this.sessionForm.value.desc.trim() || '';
    apiPayLoad.timeZone = this.sessionForm.value.timeZone || '';
    apiPayLoad.duration = this.sessionForm.value.duration || 30;
    apiPayLoad.status = SESSION_STATUS.WILL_START;
    apiPayLoad.created_by = this.auth.currentUserValue.id;
    apiPayLoad.starts = utcDateConversion(this.sessionForm.value.sessionDate);
    if (this.sessionId) {
      apiPayLoad.id = this.sessionId;
    }
    console.log(apiPayLoad, 'api payload');
    Object.keys(apiPayLoad).forEach((key) => {
      formData.append(key, apiPayLoad[key]);
    });
    return formData;
  }

  submitSession() {
    this.submitted = true;
    console.log(this.sessionForm);
    if (this.sessionForm.valid) {
      this.loading = true;
      if (this.sessionId) {
        this.updateSession();
      } else {
        this.saveSession();
      }
    }
  }

  updateSession() {
    let apiObj: FormData = this.getApiPayload();
    this.sessionService
      .updateSessions(apiObj)
      .then((res: any) => {
        this.loading = false;
        if (res.error) {
          this.showMessage();
        } else {
          this.showMessage(true, true);
          this.closeModal(true);
        }
      })
      .catch((err) => {
        console.log(err, ' error on session Update');
        this.loading = false;
        this.showMessage();
      })
      .finally(() => {
        this.loading = false;
      });
  }

  // save Session Form Value
  saveSession() {
    let name = this.sessionForm.value.title.trim() || '',
      apiObj: FormData = this.getApiPayload(),
      member = this.sessionForm.value.invites || [],
      members = [];
    members.push(this.auth.currentUserValue.emailId);
    member.map((a) => members.push(a.email));
    if (this.sessionForm.valid) {
      this.loading = true;
      this.chatService
        .createGroup(name, members, '')
        .then((res) => {
          apiObj.append('uri', res.group.gid);
          console.log(apiObj, 'api object');
          return this.sessionService.addSessions(apiObj);
        })
        .then((result: any) => {
          this.loading = false;
          if (result.error) {
            this.showMessage();
          } else {
            this.showMessage(true);
            this.closeModal(true);
          }
        })
        .catch((err) => {
          console.log(err, ' error on session add');
          this.loading = false;
          this.showMessage();
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  closeModal(reload = false) {
    this._bsModalRef.hide();
    this.onCloseEvent.emit(reload);
  }

  showMessage(type = false, updated = false) {
    this.utilityService.alertMessage(
      type ? 'success' : 'error',
      type
        ? updated
          ? SESSION_MESSAGES.UPDATE_SUCCESS
          : SESSION_MESSAGES.ADD_SUCCESS
        : SESSION_MESSAGES.COMMON_ERROR
    );
  }

  ngOnDestroy() {
    this.initSessionForm();
  }
}
