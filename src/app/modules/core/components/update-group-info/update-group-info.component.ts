import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { QBDialogueService } from '../messenger/qb/services/qbDialogue.service';
import { UtilityService } from '../../../../shared/services/utility.service';
import { QBCONSTAND } from '../../helpers/app.config';
import { QBMessageService } from '../messenger/qb/services/qbMessage.service';
import { DomSanitizer } from '@angular/platform-browser';
import { QBHelperService } from '../messenger/qb/helpers/qbHelper.service';


@Component({
  selector: 'app-update-group-info',
  templateUrl: './update-group-info.component.html',
  styleUrls: ['./update-group-info.component.scss']
})
export class UpdateGroupInfoComponent implements OnInit, OnDestroy {


  groupForm: FormGroup;
  loading: boolean = false;
  currentDialogueId: any;
  imageFile: any;
  groupImageUrl;
  imageError: any;
  formInitialized: boolean = false;
  @Output() onCloseEvent = new EventEmitter<boolean>();
  @Input()
  public set dialogueId(dialogueId: string) {
    if (dialogueId) {
      this.initForm(),
        console.log('current dialogue', dialogueId);
      this.currentDialogueId = dialogueId;
      this.setGroupValue(dialogueId);
    }
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(evt: KeyboardEvent) {
    this.onCloseEvent.emit(false);
  }

  constructor(private qbDialogue: QBDialogueService,
    private qbMessage: QBMessageService,
    private domSanitizer: DomSanitizer,
    private qbHelpers: QBHelperService,
    private utilityService: UtilityService) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(hardToInit = false) {
    if (this.formInitialized && !hardToInit) {
      return true;
    }
    this.formInitialized = true;
    this.groupForm = new FormGroup({
      groupName: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.maxLength(140)]),
      profileImage: new FormControl(null)
    });
  }

  setGroupValue(dialogueId) {
    let qbDialogue = this.getDialogById(dialogueId),
      description = qbDialogue.data ? qbDialogue.data.description : '';
    this.groupImageUrl = qbDialogue.photo ? this.getFileUrl(qbDialogue.photo) : null;
    this.imageFile = null;
    this.groupForm.patchValue({
      groupName: qbDialogue.name,
      description: description
    })
  }

  getDialogById(id) {
    return this.qbDialogue.checkDialogueExists(id);
  }

  prepareApiPayload() {
    let payload: any = {};
    payload.data = {
      class_name: 'dialogue_info',
      description: this.groupForm.value.description,
    };
    payload.name = this.groupForm.value.groupName;
    return payload;
  }

  onChangeFile(e) {
    if (!e.currentTarget.value) {
      return;
    }
    let files: any = e.currentTarget.files[0];
    this.groupImageUrl = this.safeUrl(URL.createObjectURL(files));
    this.imageFile = files;
    e.currentTarget.value = null;
  }

  getFileUrl(id) {
    return this.qbMessage.getFileUrl(id);
  }

  async uploadImage(file) {
    if (file.size >= QBCONSTAND.ATTACHMENT.MAXSIZE) {
      this.loading = false;
      this.imageError = 'File Size Exceed';
      return alert(QBCONSTAND.ATTACHMENT.MAXSIZEMESSAGE);
    }
    await this.qbMessage.abCreateAndUpload(file).then((response) => {
      this.imageFile = '';
      this.deleteOldImage();
      this.updateInfo(response.uid);
    }).catch((err) => {
      this.loading = false;
      this.imageError = 'File Upload Error';
      alert('ERROR: ' + err.detail);
    });
  }

  deleteOldImage() {
    let dialogue = this.getDialogById(this.currentDialogueId);
    if (dialogue.photo) {
      this.qbHelpers.deleteFileById(dialogue.photo).then(res => {
        console.log('delete file successful', res)
      });
    }
  }


  updateGroupInfo() {
    this.loading = true;
    if (this.imageFile) {
      this.uploadImage(this.imageFile);
    } else {
      this.updateInfo();
    }
  }

  updateInfo(imgId = null) {
    if (!this.groupForm.valid) {
      return;
    }

    let payload: any = this.prepareApiPayload();
    if (imgId) {
      payload.photo = imgId;
    }
    this.qbDialogue.updateDialog(this.currentDialogueId, payload).then(res => {
      this.loading = false;
      this.utilityService.alertMessage('success', 'update group info successfully');
      this.closeModal();
    }).catch(err => {
      this.loading = false;
      this.utilityService.alertMessage('error', 'failed to update group info');
    });
  }

  safeUrl(url) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closeModal() {
    this.onCloseEvent.emit(false);
  }

  ngOnDestroy(): void {
    this.initForm(true);
    this.imageFile = null;
    this.groupImageUrl = null;
    this.imageError = '';
  }

}
