import { Injectable, EventEmitter } from '@angular/core';
declare var QB: any;
declare var $: any;
import { QBService } from './qb.service';
import {
  MULTIPART_SERVER,
  VIDEO_RESOLUTION,
  QBCONSTAND,
  CALLSTATUS,
  AUDIO_CALL_ENABLE,
} from '../../../../helpers/app.config';
import { QBHelperService } from '../helpers/qbHelper.service';
import { AuthService } from '../../../../../users/services/auth.service';
import { isEmptyObj } from '../../../../mesibo/helpers/utilityHelper';
declare var QBVideoConferencingClient: any;
declare var window: any;
declare var navigator: any;

@Injectable({
  providedIn: 'root',
})
export class QBVideoService {
  currentVideoSession: any = {};
  currentCall: any = {
    isAudioOnly: true,
    type: 3, //dialogue type private 
    callIsInProgress: false,
    callAccept: false,
    callInitiator: false,
    sendMissedCallReport: false,
    sendCallReport: false
  };
  //conferenceSession: any;
  currentFeed: any = {};
  empid = 'callerStream_';
  audioStatus: boolean = true;
  videoStatus: boolean = true;
  videoDevice: boolean = true;
  screenSharing: boolean = false;

  callTimeSec: number = 0;
  timerIntervale: any;
  userId = this.auth.currentUserValue.qbid;
  mainStream: any = {};
  defaultStream: any = {};
  constructor(
    private QBService: QBService,
    private qbHelper: QBHelperService,
    private auth: AuthService
  ) { }

  registerVideoListner() {
    console.log('register video call listener');
    QB.webrtc.onCallListener = this.onCallListener.bind(this);
    QB.webrtc.onAcceptCallListener = this.onAcceptCallListener.bind(this);
    QB.webrtc.onUserNotAnswerListener = this.onUserNotAnswerListener.bind(this);
    QB.webrtc.onRemoteStreamListener = this.onRemoteStreamListener.bind(this);
    QB.webrtc.onSessionCloseListener = this.onSessionCloseListener.bind(this);
    QB.webrtc.onUpdateCallListener = this.onUpdateCallListener.bind(this);
    QB.webrtc.onRejectCallListener = this.onRejectCallListener.bind(this);
    QB.webrtc.onStopCallListener = this.onStopCallListener.bind(this);
    QB.webrtc.onCallStatsReport = this.onCallStatsReport.bind(this);
    QB.webrtc.onSessionConnectionStateChangedListener = this.onSessionConnectionStateChangedListener.bind(this);
  }

  onSessionConnectionStateChangedListener(session, userID, connectionState) {
    let connection_status;
    switch (connectionState) {
      case QB.webrtc.SessionConnectionState.CONNECTED:
        connection_status = 'connected';
        break;

      case QB.webrtc.SessionConnectionState.CONNECTING:
        connection_status = 'connecting...';
        break;

      case QB.webrtc.SessionConnectionState.COMPLETED:
        connection_status = 'Completed';
        break;

      case QB.webrtc.SessionConnectionState.FAILED:
        connection_status = 'failed...';
        break;

      case QB.webrtc.SessionConnectionState.DISCONNECTED:
        connection_status = 'disconnected...';
        break;

      default:
        break;
    }

    console.log(connection_status, 'connection state change')
    if (isEmptyObj(this.currentCall) && isEmptyObj(this.currentFeed)) {
      if (connectionState == QB.webrtc.SessionConnectionState.CONNECTED || connectionState == QB.webrtc.SessionConnectionState.CONNECTING) {
        session.stop({})
      }
    }
  }

  startTimer(stop = false) {
    //  const numbers = timer(5000);
    if (stop) {
      clearInterval(this.timerIntervale);
      this.callTimeSec = 0;
    } else {
      this.timerIntervale && clearInterval(this.timerIntervale);
      this.callTimeSec = 0;
      this.timerIntervale = setInterval(() => { this.timer(); }, 1000);
    }
  }

  timer() {
    this.callTimeSec++;
  }

  onCallStatsReport(session, userId, stats, error) {

    console.log('<---SESSION LOG--- >');
    console.log('SESSION OBJECT   ', session)
    console.log('SESSION STATUS -- ', stats)
    console.log('SESSION ERROR -- >',error)
    console.log('<---SESSION LOG END--- >');
  }

  onCallListener(session, extension) {
    console.log(session, 'on Call listener');
    if (session.initiatorID != this.userId) {
      this.qbHelper.notifyAboutState(QBCONSTAND.NOTIFICATION_TYPES.PRIVATE_CALL_RINGING, extension.dialog_id, extension.dialog_id),
        this.QBService.setEvent('INCOMING_PRIVATE_CALL', extension, session);
    }
  }
  onAcceptCallListener(session, userId, extension) {
    this.startTimer();
    this.addFeedData(userId);
    this.QBService.setEvent('PRIVATE_CALL_ACCEPT', session, 'Call Accepted');
    this.changeCallStatus(CALLSTATUS.ONCALL);
    this.currentVideoSession.update({ filter: 'accepted' });
  }

  onUserNotAnswerListener(session, userId) {
    console.log(session, 'on Call not Answered');
    this.QBService.setEvent('NOT_ANSWER_CALL', session, 'Call not Answer');
    this.stopcall();
  }

  onRemoteStreamListener(session, userID, remoteStream) {
    // attach the remote stream to DOM element
    console.log("remoteStream", remoteStream);
    let state = this.currentVideoSession.connectionStateForUser(userID),
      peerConnList = QB.webrtc.PeerConnectionState;

    if (state === peerConnList.DISCONNECTED || state === peerConnList.FAILED || state === peerConnList.CLOSED) {
      return false;
    }
    this.addFeedData(userID);

    //if (this.screenSharing == false) {
    //this.makeMainStream(userID);
    //} else {
    this.currentVideoSession.peerConnections[userID].stream = remoteStream;
    this.currentVideoSession.attachMediaStream(this.empid + userID, remoteStream, { mirror: false });
    //}
    this.changeCallStatus(CALLSTATUS.ONCALL);
    this.updateStreamFeed(userID, 'video', true);
  }

  onSessionCloseListener(session) {
    console.log(session, 'session close listerner');
    this.changeCallStatus(CALLSTATUS.STOPCALL);
    this.QBService.setEvent('STOPCALL', {}, true);
    this.QBService.setEvent('CALL_LOGS', {}, 'session end');
    this.stopLocalStream();
    this.startTimer(true) //stop timers
    this.QBService.setEvent('PRIVATE_CALL_CLOSED', session, true);
  }

  onUpdateCallListener(session, userId, extension) {
    console.log('update call listener ', userId, extension)
    if (userId == extension.to) {
      console.log('update only taken by owner of stream')
    }
    let user_id = parseInt(extension.to) || userId;
    if (user_id == this.userId) return;
    //this.currentVideoSession = session;
    switch (extension.action) {
      case "STREAM_UPDATE":
        this.updateStreamFeed(user_id, extension.data.type, extension.data.status);
        break;

      case "LEFT_CALL":
        this.removeFeedData(userId);
        break;
      case "SCREEN_SHARE":
        this.stopScreenSharing(false);
        break;
      case "STOP_SCREEN_SHARE":
        this.stopScreenSharing(false, user_id);
        break;
      case "STOP_CALL":
        this.stopcall();
        break;
    }
    console.log('on update call listener   ', extension);
  }

  onStopCallListener(session, userId, extension) {
    console.log('on stop Listener');
    this.changeCallStatus(CALLSTATUS.STOPCALL);
  }

  onRejectCallListener(session, userId, extension) {
    console.log('on reject call listener');
    if (userId) {
      this.changeCallStatus(CALLSTATUS.STOPCALL);
    }
    this.QBService.setEvent('PRIVATE_CALL_REJECT', userId, 'Call rejected by' + userId);
  }

  acceptCall(session = null, isAudioOnly = false) {
    if (!isEmptyObj(this.currentVideoSession)) {
      this.stopcall();
    }
    if (session) {
      this.startTimer();
      this.currentVideoSession = session;
    }
    this.addFeedData(this.userId),
      this.currentCall.isAudioOnly = isAudioOnly;   // to set current call type
    //console.log('current call tyepe', isAudioOnly)
    this.getUserMediaParams(false);
  }

  rejectCall(session) {
    if (!isEmptyObj(session)) {
      var extension = { userId: this.userId };
      session.reject(extension);
    }
  }

  getDefaultVideoTrack() {
    if (!isEmptyObj(this.defaultStream)) {
      return this.defaultStream.getVideoTracks()[0]
    }
    return false;
  }

  getUserMediaParams(makeCall = false, dialogueId = null) {
    let mediaParams: any = {
      audio: true,
      video: false,
      options: {
        muted: true,
        mirror: true,
      },
      elemId: this.empid + this.userId
    };
    this.addFeedData(this.userId);
    var self = this;
    if (this.currentCall.isAudioOnly == false) {
      this.updateStreamFeed(this.userId, 'video', true);
      mediaParams.video = true;
      mediaParams.options.mirror = true;
    }

    this.currentVideoSession.getUserMedia(mediaParams, async (err, stream) => {
      if (
        err || !stream.getAudioTracks().length) {
        //alert('error get camera video');
        this.QBService.setEvent('PRIVATE_CALL_MEDIA_ERROR', this.userId, 'Error not able to load media ');
        console.log(err, ' error on fetch media')
        this.stopcall();
        if (makeCall == false) {
          this.updateSession("STOP_CALL", true); // close remote side  initiator call
        }
      } else {
        if (stream.getVideoTracks().length) {
          this.updateStreamFeed(this.userId, 'video', true);
          this.videoStatus = true;
        } else if (!AUDIO_CALL_ENABLE) {
          await stream.addTrack(this.defaultStream.getVideoTracks()[0], stream); // if audio call, default stream will attache
          this.videoStatus = false;
        }

        this.updateStreamFeed(this.userId, 'audio', true);
        this.audioStatus = true;
        this.currentVideoSession.localStream = stream;
        let extension = {
          dialog_id: dialogueId,
          userId: this.userId,
          isAudioOnly: this.currentCall.isAudioOnly
        };

        if (makeCall) {
          console.log('making call ...',this.currentVideoSession),
            this.currentVideoSession.call(extension, function (error) {
              if (error) {
                self.changeCallStatus(CALLSTATUS.STOPCALL);
              } else {
                self.changeCallStatus(
                  CALLSTATUS.CALLING,
                  QBCONSTAND.DIALOG_TYPES.CHAT,
                  true
                );
                console.log('placed call ...', self.currentVideoSession);
              }
            });
        } else {
          console.log('accepting call ...'),
            this.currentVideoSession.accept({}),
            this.addFeedData(this.currentVideoSession.initiatorID);
          this.changeCallStatus(
            CALLSTATUS.ONCALL,
            QBCONSTAND.DIALOG_TYPES.CHAT,
            false
          );
        }
      }
    });
  }

  updateSession(action, values, to = this.userId) {
    if (this.currentVideoSession) {
      this.currentVideoSession.update({ action: action, data: values, to: to });
    }
  }

  switchMediaTrack(track) {
    if (this.currentVideoSession.localStream) {
      let stream = this.currentVideoSession.localStream.clone();
      if (this.currentVideoSession.localStream.getVideoTracks().length) {
        this.currentVideoSession.localStream.getVideoTracks()[0].stop();
        stream.removeTrack(stream.getVideoTracks()[0]);
      }
      stream.addTrack(track);
      this.stopLocalStream();
      this.currentVideoSession._replaceTracks(stream);
      this.currentVideoSession.localStream = stream;
    }
    return true;
  };

  async shareCamera() {
    var mediaParams = {
      video: true
    },
      self = this;
    self.stopVideoStream();
    const mediaDevices = navigator.mediaDevices as any;
    mediaDevices.getUserMedia(mediaParams).then(stream => {
      let videoTrack = stream.getVideoTracks()[0];
      if (stream.getAudioTracks().length) {
        stream.getAudioTracks()[0].stop();
      }
      videoTrack.onended = self.stopCamera.bind(self);
      self.switchMediaTrack(videoTrack),
        self.updateStreamFeed(self.userId, 'video', true);
    }).catch(err => {
      self.updateStreamFeed(self.userId, 'video', false);
    });

  }

  stopCamera() {
    this.updateStreamFeed(this.userId, 'video', false);
  }

  //swap element stream
  swapElement(user_id, isMain = false) {
    let isRemoteStream = this.userId === user_id ? false : true
    let swapElm = isMain ? 'private_call_main_stream' : this.empid + user_id;
    if (isEmptyObj(this.mainStream) && isMain) {
      if (isRemoteStream == false) {
        this.swapStream(false, user_id, swapElm);
        return;
      }
    } else if (isMain) {
      let elemId = this.empid + user_id;
      if (this.mainStream.user_id == this.userId) {
        this.swapStream(false, this.mainStream.user_id, elemId)
      } else {
        this.swapStream(true, this.mainStream.user_id, elemId)
      }
    }
    this.swapStream(isRemoteStream, user_id, swapElm);
  }

  swapStream(remote = false, user_id, elemId) {
    let options = {
      mirror: true,
    }
    var elem: any = document.getElementById(elemId);
    //elem.removeAttr('muted');
    if (this.currentVideoSession.localStream && remote == false) {
      elem.muted = true;
      this.currentVideoSession.detachMediaStream(this.currentVideoSession.localStream);
      this.currentVideoSession.attachMediaStream(elemId, this.currentVideoSession.localStream, options);
    }

    if (this.currentVideoSession.peerConnections[user_id] && remote == true) {
      if (this.currentVideoSession.peerConnections[user_id].remoteStream) {
        elem.muted = false;
        this.currentVideoSession.detachMediaStream(this.currentVideoSession.peerConnections[user_id].remoteStream);
        this.currentVideoSession.attachMediaStream(elemId, this.currentVideoSession.peerConnections[user_id].remoteStream, options);
      }
    }
  }

  async shareScreen() {
    var self = this;
    const mediaDevices = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia as any;
    await window.navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'motion',
        logicalSurface: true
      }
    }).then(stream => {
      self.stopVideoStream();
      let videoTrack = stream.getVideoTracks()[0];
      if (stream.getAudioTracks().length) {
        stream.getAudioTracks()[0].stop();
      }
      videoTrack.onended = self.stopScreenSharing.bind(self);
      self.switchMediaTrack(videoTrack);
      self.screenSharing = true;
      self.updateStreamFeed(self.userId, 'screen', true);
      self.updateSession("SCREEN_SHARE", self.userId);
    });
  }

  stopLocalStream() {
    this.stopAudioStream();
    this.stopVideoStream();
    if (this.currentVideoSession.localStream) {
      this.currentVideoSession.detachMediaStream(this.currentVideoSession.localStream)
    }
  }

  stopVideoStream() {
    if (this.currentVideoSession.localStream) {
      this.currentVideoSession.localStream.getTracks().forEach(function (track) {
        if (track.readyState == 'live' && track.kind === 'video') {
          track.stop();
        }
      });
      this.updateStreamFeed(this.userId, 'video', false);
    }
  }

  stopAudioStream() {
    if (this.currentVideoSession.localStream) {
      this.currentVideoSession.localStream.getTracks().forEach(function (track) {
        if (track.readyState == 'live' && track.kind === 'audio') {
          track.stop();
        }
      });
    }
  }

  //handle stop the video stream 
  stopVideo() {
    if (this.screenSharing) {
      this.stopScreenSharing();
    } else {
      this.toggleStream('video', false)
    }
  }

  async stopScreenSharing(event_btn = true, userId = false) {
    console.log('stop screen share')
    var self = this;
    let user_id = userId ? userId : self.userId;
    if (event_btn) {
      self.updateSession("STOP_SCREEN_SHARE", self.userId);
      if (self.screenSharing) {
        self.stopVideoStream();
      }
      self.screenSharing = false;
    }
    this.updateStreamFeed(user_id, 'screen', false);
  }

  makeCall(dialog, isAudioOnly = false, userId) {
    this.addFeedData(userId);
    let participantId = [];

    if (this.currentCall.callIsInProgress) {
      return true;
    }
    this.startTimer();
    participantId = dialog.occupants_ids.filter(a => a != userId);
    let sessionType = !isAudioOnly
      ? QB.webrtc.CallType.VIDEO
      : !AUDIO_CALL_ENABLE ? QB.webrtc.CallType.VIDEO : QB.webrtc.CallType.AUDIO;
    //let additionalOptions = { bandwith: '' };
    this.currentVideoSession = QB.webrtc.createNewSession(
      participantId,
      sessionType,
      null
    );
    if (this.currentVideoSession !== undefined && this.currentVideoSession) {
      console.log('session created', this.currentVideoSession);
      this.currentCall.isAudioOnly = isAudioOnly;
      this.getUserMediaParams(true, dialog._id);
    }
  }


  toggleStream(stream = 'audio', status = false) {
    if (this.currentVideoSession) {
      if (status) {
        this.currentVideoSession.unmute(stream);
      } else {
        this.currentVideoSession.mute(stream);
      }
    }
    this.updateStreamFeed(this.userId, stream, status);
    this.updateSession("STREAM_UPDATE", { type: stream, status: status });
  }

  removeMainStream() {
    if (isEmptyObj(this.mainStream)) {
      this.mainStream.videoStatus == false;
      return false;
    } else {
      for (const [key, value] of Object.entries(this.currentFeed)) {
        this.currentFeed[key].mainStream = false;
      }
      this.swapElement(this.mainStream.userid);
      this.mainStream.videoStatus == false;
    }
  }

  // make main Stream
  makeMainStream(userID) {
    if (this.currentFeed[userID]) {
      this.swapElement(userID, true);
      for (const [key, value] of Object.entries(this.currentFeed)) {
        this.currentFeed[key].mainStream = false;
      }
      this.currentFeed[userID].mainStream = true;
    }
    this.mainStream.videoStatus = true;
  }

  updateStreamFeed(userId, stream, streamStatus: any = false) {
    if (isEmptyObj(this.currentFeed)) {
      return;
    }
    let status = (streamStatus == 'false' || streamStatus == false) ? false : true;
    console.log('update stream feed', userId, stream, status, this.userId == userId);
    if (stream == 'audio') {
      if (this.userId == userId) {
        this.audioStatus = status
      }
      this.currentFeed[userId] ? this.currentFeed[userId].audioStatus = status : null;
    } else if (stream == 'screen') {
      if (this.userId == userId) {
        this.videoStatus = status;
      }
      if (status) {
        this.currentFeed[userId] ? this.currentFeed[userId].videoStatus = status : false;
      }
      this.currentFeed[userId] ? this.currentFeed[userId].screenSharing = status : false;
    } else {
      if (this.userId == userId) {
        this.videoStatus = status;
      }
      if (status) {
        this.currentFeed[userId] ? this.currentFeed[userId].screenSharing = false : false;
      }
      this.currentFeed[userId] ? this.currentFeed[userId].videoStatus = status : false;
    }

    if ((stream == "screen" || stream == 'video') && status == true) {
      this.currentCall.isAudioOnly = false;
    }
    // this.mainStream = {};
    // for (const [key, value] of Object.entries(this.currentFeed)) {
    //   let val: any = value;
    //   if (val.mainStream == true) {
    //     this.mainStream = value;
    //     break;
    //   }
    // }

    this.setEventFeedChange();
    if (this.userId == userId) {
      this.updateSession("STREAM_UPDATE", { type: stream, status: status });
    }
  }

  stopcall() {
    if (this.currentVideoSession.hasOwnProperty('callType')) {
      if (this.currentVideoSession.localStream) {
        console.log('stop call local stream ', this.currentVideoSession);
        this.stopLocalStream();
        this.currentVideoSession.stop({});
        this.updateSession("LEFT_CALL", true);
      }
    }
    this.changeCallStatus(CALLSTATUS.STOPCALL);
    this.startTimer(true);  // stop timer
  }

  addFeedData(userid) {
    let isLocal = this.userId == userid,
      id = isLocal ? 'local' : 'remote';
    console.log(userid + ' user id');
    const tmpObj: any = {};
    tmpObj[userid] = {};
    tmpObj[userid].user_id = userid;
    tmpObj[userid].isLocal = isLocal;
    tmpObj[userid].mainStream = false;
    tmpObj[userid]._id = id + '_' + userid;
    tmpObj[userid].videoStatus = false;
    tmpObj[userid].audioStatus = false;
    tmpObj[userid].screenSharing = false;
    if (this.currentFeed[userid]) {
      return;
    }
    this.currentFeed = Object.assign(tmpObj, this.currentFeed);
    this.setEventFeedChange();
  }

  setEventFeedChange() {
    this.QBService.observeQBEvents.next({
      type: 'FEED_CHANGED',
      data: Object.values(this.currentFeed),
      status: this.mainStream,
    });
  }

  removeFeedData(userid) {
    console.log('remove feed ', userid);
    delete this.currentFeed[userid];
    this.setEventFeedChange();
  }


  changeCallStatus(status, calltype = null, isInitator = false) {
    if (calltype) {
      this.currentCall.type = calltype;
    }
    if (isInitator) this.currentCall.callInitiator = isInitator;

    switch (status) {
      case CALLSTATUS.ONCALL:
        this.currentCall.callIsInProgress = true;
        this.currentCall.onCalling = false;
        this.currentCall.sendCallReport = false;
        this.currentCall.sendMissedCallReport = true;
        break;

      case CALLSTATUS.CALLING:
        this.currentCall.callIsInProgress = false;
        this.currentCall.onCalling = true;
        this.currentCall.sendCallReport = true;
        this.currentCall.sendMissedCallReport = false;
        break;
      case CALLSTATUS.STOPCALL:
        this.currentCall = {};
        this.currentFeed = {};
        this.screenSharing = false;
        break;
    }
  }
}