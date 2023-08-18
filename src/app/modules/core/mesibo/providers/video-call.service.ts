import { Injectable, EventEmitter } from '@angular/core';
import { MessageService } from './message.service';
import { isEmptyObj } from '../helpers/utilityHelper';
declare const MESIBO_FLAG_DEFAULT: any, MESIBOCALL_VIDEOSOURCE_SCREEN, MESIBOCALL_VIDEOSOURCE_CAMERADEFAULT, MESIBO_CALLSTATUS_CHANNELUP, MESIBO_CALLSTATUS_COMPLETE, MESIBO_CALLSTATUS_RECONNECTING, MESIBO_CALLSTATUS_CANCEL;
declare const MESIBO_FLAG_DELIVERYRECEIPT, MESIBO_FLAG_READRECEIPT, MESIBO_FLAG_TRANSIENT, MESIBO_FLAG_EOR, MESIBO_ORIGIN_REALTIME, MESIBOCALL_HANGUP_REASON_REMOTE, MESIBOCALL_HANGUP_REASON_USER;
declare const STREAM_CAMERA = 1;
import {callInfo, UserData} from '../helpers/DTO/users';
import { groupCallInProgressNotify, GroupCallNotify } from '../providers/mesibo_groupcall_notify';
@Injectable({
  providedIn: 'root'
})

export class VideoCallService extends MessageService {
  currentCallList: any = []; //{}
  videoSession: any;
  conferenceSession: any = {};
  publisherSession: any = {};
  userData: UserData = null;
  streams: any = [];
  LOCAL_SCREEN_SHARE = false;
  participantList = [];
  mainStream: any = {};
  localStream: any;
  callTimeSec: number = 0;
  timerIntervale: any;
  callNotification: EventEmitter<any> = new EventEmitter();
  groupCallInProgressNotify;
  MAIN_STREAM_ID = 'main_Stream';
  MAIN_STREAM_SHOW:boolean=false;
  constructor() {
    super()
    globalThis.scope = this;
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

  hangupCall() {
    console.log('hang call ', this.publisherSession)
    if (!isEmptyObj(this.publisherSession) && this.publisherSession.hangup) {
      console.log('hang call ', this.conferenceSession);
      this.clearAllStream(),
        this.publisherSession.hangup();
      this.publisherSession.isConnected = false;
      this.publisherSession.streamOptions = true,
        this.conferenceSession.leave(),
        this.clearCall();
      console.log('end call');
    }
  }
  clearAllStream() {
    if (this.streams.length) {
      for (var i = 0; i < this.streams.length; i++) {
        this.streams[i].hangup();
      }
    }
    this.startTimer(true); // stop timer
  }

  clearCall() {
    this.streams = [];
    this.publisherSession = {};
    this.conferenceSession = {};
    this.participantList = [];
    this.userData = null;
    this.startTimer(true);
  }

  initConference(user: UserData, groupid) {
    console.log('joining conf....', user + groupid);
    this.clearCall();
    //this.groupCallInProgressNotify=new groupCallInProgressNotify(this);
    let groupCallNotify = new GroupCallNotify(this);
    this.conferenceSession = this.videoSession.groupCall(groupCallNotify, groupid),
      //this.conferenceSession.setRoom(groupid),
      this.conferenceSession.join(groupCallNotify),
      this.publisherSession = this.conferenceSession.createPublisher(0),
    this.publisherSession.setVideoSource(MESIBOCALL_VIDEOSOURCE_CAMERADEFAULT);
    this.userData = user;
    this.userData.groupid=groupid;
    this.publisherSession.setUserData(this.userData);
    this.callStream(this.publisherSession, true, true),
    this.mainStream = this.publisherSession,
      //this.publisherSession.call();
      this.startTimer(); //start timer
    console.log(this.conferenceSession, ' call initiated');
    console.log(this.publisherSession, ' Publisher Session');
  }

  
  publishStream(stream) {
    if (isEmptyObj(stream))
      return;
    let o: any = {};
    o.video = true;
    o.audio = true;
    o.source = 1;

    let init_audio = false;
    let init_video = false;
    let stream_element_id = 'localVideo';

    if (stream.getType() && stream.getType() > 0) {
      o.source = MESIBOCALL_VIDEOSOURCE_SCREEN;
      o.audio = true;
    }

    stream.streamOptions = false;
    stream.isPublished = true;

    let res = this.connectStream(stream, stream_element_id);

  }

  connectStream(s, e) {
    console.log(this.streams, ' stream list');
    console.log('connectStream params', s, e);
    let rv = s.setVideoView(e, this.on_stream, 100, 2);
    //let rv = s.call(o, e, this.on_stream, this.on_status);
    return rv;
  }


  updateParticipant(p) {
    if (isEmptyObj(p))
      return false;
    let index = this.isExitingParticipant(p);
    if (index != -1)
      return;
    this.participantList.push(p);
  }

  streamLocalVideo(isAudio = true, isVideo = true) {
    console.log('streamFromCamera');
    this.publisherSession.setVideoSource(MESIBOCALL_VIDEOSOURCE_CAMERADEFAULT),
    //this.publisherSession.call(o, "localVideo", this.on_stream, this.on_status);
    this.callStream(this.publisherSession, isAudio, isVideo),
      console.log('local publisher', this.publisherSession, this.publisherSession.getName(), this.publisherSession.getId());
    //this.publisherSession.setName(this.publisherSession.getName());
  }

  callStream(s, isAudio, isVdeo) {
    s.call(isAudio, isVdeo, new groupCallInProgressNotify(this));
  }

  onVideoConnected(p, connected) {
    if (p.isLocal()) {
      if (connected) {
        this.publisherSession.isConnected = true;
      } else {
        this.publisherSession.isConnected = false;
      }
    }
    for (var i = 0; i < this.streams.length; i++) {
      if (this.streams[i] == p) {
        if (connected) {
          this.streams[i].isConnected = true;
        } else {
          this.streams[i].isConnected = false;
        }
      }
    }
  }

  shareYourScreen() {
    this.publisherSession.changeSource(MESIBOCALL_VIDEOSOURCE_SCREEN);
    //this.callStream(this.publisherSession, true, true),
      console.log('local screen publisher', this.publisherSession, this.publisherSession.getName(), this.publisherSession.getId());
    this.publisherSession.setName(this.publisherSession.getName());
  }


  toggleSelfVideo() {
    try {
      this.publisherSession.toggleMute(true, false);
    }catch{
      this.streamLocalVideo();
      return ;
    }

    if (this.publisherSession.muteStatus(true))
      this.callNotification.emit('You have muted your video');
    else
      this.callNotification.emit('You have unmuted your video');
  }

  toggleSelfAudio() {
    this.publisherSession.toggleMute(false, false);
    console.log(this.publisherSession, ' publisher session');
    if (this.publisherSession.muteStatus(false))
      this.callNotification.emit('You have muted your audio');
    else
      this.callNotification.emit('You have unmuted your audio');
  }

  toggleRemoteVideo(p) {
    let index = this.isExitingStream(p);
    if (index != -1) {
      var s = this.streams[index];
      if (s)
        s.toggleMute(true, false);
    }
  }

  toggleRemoteAudio(p) {
    let index = this.isExitingStream(p);
    if (index != -1) {
      var s = this.streams[index];
      if (s)
        s.toggleMute(false, false);
    }
  }



  isExitingStream(stream) {
    let index = this.streams.findIndex(e => stream.getAddress() == e.getAddress());
    return index;
  }

  async updateStream(s) {
    console.log('updateStreams', s, s.getType(), s.getId());
    if (isEmptyObj(s))
      return;

    let index = await this.isExitingStream(s);
    if (index != -1) {
      this.streams[index] = s;
      return;
    }
    s.element_id = 'video_' + s.getAddress();
    s.isConnected = false;
    let o: any = {};
    this.streams.push(s),
      this.connectStream(s, s.element_id);
  }

  // subscribe stream 
  subscribeStream(s, isAudio = true, isVideo = true) {
    console.log('====> subscribe', s.getId(), s.element_id);
    s.isSelected = false;
    s.isConnected = true;
    s.isAudio = isAudio;
    s.isVideo = isVideo;
    s.isExpandedScreen = false;
    this.callStream(s, true, true); // make subscribe 
    this.updateParticipant(s);
    this.updateStream(s);
  }

  //get stream
  getSelectedStream(stream_index) {
    if (stream_index > this.streams.length)
      return null;
    var selected_stream = this.streams[stream_index];

    return selected_stream;
  }

  //get call after published your videos
  on_stream(p) {
    console.log('on_stream', p);
    // let scope = globalThis.scope;
    // let index = scope.isExitingStream(p);
    // if (index != -1)
    //   scope.updateStream(p);
    //Local Stream
    // if (p.isLocal()) {
    //   p.attach("localVideo", this.on_attach);
    //   return;
    // }
    // console.log('===> on_stream', p.element_id, 'attach');
    // p.attach(p.element_id, this.on_attach);
  }


  //published video status
  on_status(p, status) {
    console.log('on_status', p.getId(), p.getName(), 'local?', p.isLocal(), ' status: 0x' + status.toString());
    let scope: any = globalThis.scope;
    let local = p.isLocal();
    let index = scope.isExitingStream(p);
    // call connected
    if (MESIBO_CALLSTATUS_CHANNELUP == status) {
      console.log(p.getName() + ' is connected');
      if (local)
        scope.publisherSession.isConnected = true;
      else
        scope.streams[index].isConnected = true;
    }
    //call ended / disconnect
    if (MESIBO_CALLSTATUS_COMPLETE == status) {
      console.log(p.getName() + ' has disconnected');
      if (local) {
        scope.publisherSession.isConnected = false;
      }
      else
        scope.on_hangup(p, true);
    }


    if (MESIBO_CALLSTATUS_RECONNECTING == status) {
      console.log('reconnecting')
      if (!local)
        scope.streams[index].isConnected = false;
    }

    if (MESIBO_CALLSTATUS_CANCEL == status) {
      console.log(p.getName() + ' has disconnected');
      scope.on_hangup(p, true);
    }


  }

  removeAllStream() {
    for (var i = 0; i < this.streams.length; i++) {
      //if (this.streams[i].getId() === p.getId()) {
      this.streams[i] = null; //Free up slot
      //return;
      //}
    }
  }

  //on left participant or leave call
  on_hangup(p, reason) {
    console.log('on_hangup', p);

    if (p.isLocal()) {
      console.log(p.getType(), p.source, ' get type of video ');
      if (p.getType() > 0) {
        p.hangup();
        this.removeStream(p);
        return;
      }

      let rv = this.publisherSession.hangup();
      console.log('hangup returned', rv);
      if (rv == false) return;

      this.callNotification.emit('You have hanged up');
      this.publisherSession.isConnected = false;
      this.publisherSession.streamOptions = true;
      return;
    }

    let index = this.isExitingStream(p);
    if (index == -1)
      return;

    if (MESIBOCALL_HANGUP_REASON_USER == reason) {
      this.streams[index].hangup();
    }

    if (MESIBOCALL_HANGUP_REASON_REMOTE == reason) {
      this.removeParticipant(p);
      this.callNotification.emit(p.getAddress() + ' has left the room ');
    } else {
      if (p.getType() > 0) {
        this.callNotification.emit(p.getAddress() + ' has stopped sharing the screen ');
        this.clearMainStream();
      }

      this.callNotification.emit(p.getAddress() + ' has stopped User Video source ');
    }
    this.removeStream(p);
  }

  isExitingParticipant(s) {
    let index = this.participantList.findIndex(e => s.getAddress() == e.getAddress());
    return index;
  }

  removeParticipant(s) {
    let index = this.isExitingParticipant(s);
    if (index != -1) {
      this.participantList.splice(index, 1);
    }
  }

  on_attach(e) {
    console.log('attached new video ', e);
  }

  streamRenterOnMain(p = null) {
    console.log(this.streams, ' current stream in mian');
    console.log(p.getId(), ' current stream in id');
    if (!p) {
      return false;
    }
    this.MAIN_STREAM_SHOW=true;
    let index = p ? this.streams.findIndex(a => p.getId() == a.getId()) : Math.floor(Math.random() * this.streams.length);
    console.log(index, ' current stream iid');
    this.clearMainStream();
    //this.streams[index].attach(id, this.on_attach);
    this.mainStream = this.streams[index];
    this.mainStream.element_id = this.MAIN_STREAM_ID;
    this.connectStream(this.mainStream, this.mainStream.element_id);
  }

  clearMainStream() {
    if (this.mainStream) {
      this.MAIN_STREAM_SHOW=false;
      let old_stream = this.streams.findIndex(a => a.element_id == this.MAIN_STREAM_ID);
      let s = this.getSelectedStream(old_stream);
      this.revokeStreamId(s);
      this.mainStream = null;
    }
  }

  revokeStreamId(s) {
    if (!s) {
      return false;
    }
    s.element_id = 'video_' + s.getAddress();
    this.connectStream(s, s.element_id);
  }

  removeStream(p) {
    let index = this.isExitingStream(p);
    if (index != -1) {
      this.streams.splice(index, 1);
    }
  }

  redial(index) {
    if (this.streams[index])
      this.subscribeStream(this.streams[index]);
  }

}
