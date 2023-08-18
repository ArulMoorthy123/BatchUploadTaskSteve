import { Component, OnInit, OnDestroy, EventEmitter, Output, ChangeDetectorRef, Input, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { QBService } from '../messenger/qb/services/qb.service';
import { QBDialogueService } from '../messenger/qb/services/qbDialogue.service';
import { QBCONSTAND } from '../../helpers/app.config';
import { AuthService } from '../../../users/services/auth.service';
import { QBVideoService } from '../messenger/qb/services/qbVideo.service ';
import { UtilityService } from '../../../../shared/services/utility.service';
import { QBHelperService } from '../messenger/qb/helpers/qbHelper.service';
import { CoreService } from '../../services/core.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { titleCase } from 'src/app/shared/helper/utilityHelper';
declare var html2canvas, RecordRTC, invokeSaveAsDialog, QBMediaRecorder;
@Component({
  selector: 'app-private-call',
  templateUrl: './private-call.component.html',
  styleUrls: ['./private-call.component.scss']
})
export class PrivateCallComponent implements OnInit, OnDestroy {

  qbEventSubscription: Subscription;
  userFeedData: any = [];
  currentDialogue: any = {};
  elementToRecord: any;
  canvas2d: any;
  recorder: any;
  context: any;
  QbRecord: any;
  currentCall: any = {};
  mainStream: any = {};
  dialogueId: any;
  show_chat: boolean = false;
  canvasSrc;
  streamdata: any;
  self_user_id: number;
  remoteScreenShare: boolean = false;
  videoStatus: boolean = false;
  localScreenShare: boolean = false;
  totalVideoStream: number = 0;
  @Output() onCloseEvent = new EventEmitter<boolean>();
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  constructor(private qbService: QBService,
    private qbDialogue: QBDialogueService,
    private ref: ChangeDetectorRef,
    public qbVideo: QBVideoService,
    private utilityService: UtilityService,
    private qbHelper: QBHelperService,
    private coreService: CoreService,
    public bsModalRef: BsModalRef,
    private auth: AuthService) { }

  ngOnInit(): void {
    this.initVariable(),
      this.self_user_id = this.auth.currentUserValue.qbid,
      this.qbEventSubscription && this.qbEventSubscription.unsubscribe(), // unsubscribe previous subscription exists
      this.qbEventSubscription = this.qbService
        .getObserverEvents()
        .subscribe((message: any) => {
          switch (message.type) {
            case 'STOPCALL':
              this.endCall();
              break;

            case 'FEED_CHANGED':
              let remoteUser = message.data.filter(a => a.user_id != this.self_user_id);
              //this.totalVideoStream= message.data.filter(a => a.videoStatus==true).length;
              this.remoteScreenShare = remoteUser.length ? remoteUser[0].screenSharing : false;
              this.userFeedData = message.data;
              let self_Feed = this.userFeedData.filter(a => a.user_id == this.self_user_id)[0] || {};
              this.videoStatus = self_Feed.videoStatus ? self_Feed.videoStatus : false;
              this.localScreenShare = self_Feed.screenSharing;
              this.ref.detectChanges();
              break;
            case 'NOT_ANSWER_CALL':
              this.sendCallStatus(),
                this.coreService.stopRingTone(),
                this.utilityService.alertMessage('warning', titleCase(this.currentDialogue.name) + ' is unavailable!');
              break;

            case 'PRIVATE_CALL_MEDIA_ERROR':
              this.utilityService.alertMessage('error', titleCase(this.currentDialogue.name) + ' is busy!');
              break;

            case 'PRIVATE_CALL_REJECT':
              this.sendCallStatus(),
                this.coreService.stopRingTone(),
                this.utilityService.alertMessage('warning', titleCase(this.currentDialogue.name) + ' is busy!');
              break;

            case 'PRIVATE_CALL_ACCEPT':
              this.coreService.stopRingTone();
              break;

            case 'PRIVATE_CALL_RINGING':
              this.coreService.ringTonePlay("CALL");
              break;
          }
          this.currentCall = this.qbVideo.currentCall; //change whenever events triggerd
        });
    this.currentCall = this.qbVideo.currentCall; // one time changes initially
  }

  addTextCanvas() {
    this.canvasSrc = this.canvas.nativeElement.getContext('2d');
    this.canvasSrc.font = 'italic 18px Arial';
    this.canvasSrc.textAlign = 'center';
    this.canvasSrc.textBaseline = 'middle';
    this.canvasSrc.fillStyle = 'red';
    this.canvasSrc.fillText('Hello!', 150, 50);
    this.qbVideo.defaultStream = (this.canvas.nativeElement as any).captureStream(10);
  }

  acceptCall(incomingSession, isAduioOnly = false) {
    this.currentDialogue = this.qbDialogue.currentDialogue,
      this.addTextCanvas(),
      this.dialogueId = this.qbDialogue.currentDialogue._id;
    this.qbVideo.acceptCall(incomingSession, isAduioOnly);
  }

  prepareRecord() {
    this.elementToRecord = document.getElementById('private_video_confrence');
    this.canvas2d = document.getElementById('background-canvas');
    this.context = this.canvas2d.getContext('2d');

    this.canvas2d.width = this.elementToRecord.clientWidth;
    this.canvas2d.height = this.elementToRecord.clientHeight;
    this.createCanvas();
    this.recordObject();
  }
  createCanvas() {
    var self = this;
    html2canvas(self.elementToRecord).then(function (canvas) {
      self.context.clearRect(0, 0, self.canvas2d.width, self.canvas2d.height);
      self.context.drawImage(canvas, 0, 0, self.canvas2d.width, self.canvas2d.height);
      requestAnimationFrame(self.createCanvas.bind(self));
    });

  }
  //send message to user as call notification
  sendCallStatus() {
    if (this.currentCall.callInitiator) {
      if (this.currentCall.callAccept && this.currentCall.sendCallReport == false) {
        this.qbHelper.sendMessage(this.qbVideo.callTimeSec, this.dialogueId, false, QBCONSTAND.NOTIFICATION_TYPES.CALL_REPORT, []); //send call time report 
        this.qbVideo.currentCall.sendCallReport = true;
      } else if (this.currentCall.sendMissedCallReport == false) {
        this.qbHelper.sendMessage('MISSED_CALL', this.dialogueId, false, QBCONSTAND.NOTIFICATION_TYPES.MISSED_CALL, []);// send missed call 
        this.qbVideo.currentCall.sendMissedCallReport = true;
      }
    }

  }

  recordObject() {
    this.recorder = new RecordRTC(this.canvas2d, {
      type: 'canvas'
    });
    this.recorder.startRecording();
    console.log(this.canvas2d, 'stream')
  }

  initVariable() {
    this.userFeedData = [];
  }

  shareCamera() {
    this.qbVideo.shareCamera();
  }

  makeCall(isAduioOnly = false) {
    this.ngOnInit(),
      this.addTextCanvas(),
      this.currentDialogue = this.qbDialogue.currentDialogue;
    this.dialogueId = this.qbDialogue.currentDialogue._id;
    this.qbVideo.makeCall(this.qbDialogue.currentDialogue, isAduioOnly, this.self_user_id),
      this.coreService.ringTonePlay('CONNECTING');
    var self = this;
    let recorderOpts: any = {
      onstart: this.startRecord,
      onstop: function (blob) {
        self.QbRecord.download('QB_WEBrtc_sample' + Date.now(), blob);
      },
      onerror: function (error) {
        console.error('Recorder error', error);
      }
    }
    //this.elementToRecord = document.getElementById('private_video_confrence');
    //this.QbRecord = new QBMediaRecorder(recorderOpts);
    //this.QbRecord.start(this.elementToRecord);
  }

  startRecord() {
    console.log('start recording');
  }

  stopVideo() {
    this.qbVideo.stopVideo();
  }
  async endCall() {
    //this.QbRecord.stop();
    // await this.recorder.stopRecording();
    //let blob = await this.recorder.getBlob();
    //invokeSaveAsDialog(blob);
    this.coreService.stopRingTone();
    this.sendCallStatus(),
      this.qbVideo.stopcall(),
      this.closeVideoModal();
  }

  shareScreen() {
    this.qbVideo.shareScreen();
  }

  toggleStream(stream, status = false) {
    this.qbVideo.toggleStream(stream, status);
  }

  toggleChat() {
    this.show_chat = !this.show_chat;
  }

  closeVideoModal() {
    this.bsModalRef.hide();
    this.onCloseEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.qbEventSubscription.unsubscribe();
    this.initVariable();
  }
}
