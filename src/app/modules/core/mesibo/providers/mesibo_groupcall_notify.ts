import { Subscription, bindCallback } from 'rxjs';
declare var scope: any;
declare const MESIBO_MSGSTATUS_EXPIRED;
export class GroupCallNotify {
      public scope: any;
      constructor(scope) {
            globalThis.scope = scope;
      }

 
      // You will get Notification Update participant in conference
      public MesiboGroupcall_OnPublisher = function (p, joined) {
            console.log("Mesibo_OnParticipants: ", p, " ", joined);
            globalThis.scope.notifyListenersData("ON_PARTICIPANT", { p: p, joined: joined }, true);

      }
      
      public MesiboGroupcall_OnSubscriber = function (s,joined) {
            console.log("Mesibo_onSubscribe: ", s, 'joined ', joined);
            globalThis.scope.notifyListenersData("ON_SUBSCRIBER", s, true);
      }

     
}


export class groupCallInProgressNotify {
      public scope: any;
      constructor(scope) {
            globalThis.scope = scope;
      }

      public MesiboGroupcall_OnVideo = function (p) {
            console.log("Mesibo_onVideo: ", p);
            globalThis.scope.notifyListenersData("ON_VIDEO", p);

      }

      public MesiboGroupcall_OnConnected = function (p,connected) {
            console.log('MesiboGroupcall_OnConnected', p.getId(), p.getName(), 'local?', p.isLocal(), 'connected',connected);      

            if(connected){
                  console.log(p.getName()+ ' is connected');
            }
            globalThis.scope.notifyListenersData("ON_CONNECTED", p, connected);
      }

      // You will get Notification Update participant in conference
      public MesiboGroupcall_OnMute = function(p, audioMuted, videoMuted, remote) {
            console.log('MesiboGroupcall_OnMute',audioMuted,videoMuted,remote);
            globalThis.scope.notifyListenersData("ON_MUTE", p,remote);
      }

      public MesiboGroupcall_OnHangup = function(p, reason) {
            console.log('MesiboGroupcall_OnHangup', p.getName(), reason);
            globalThis.scope.notifyListenersData("ON_HANG_UP", p, reason);

      }

      public MesiboGroupcall_OnVideoSourceChanged(newVideoSrc, prevVideoSrc) {
            console.log(newVideoSrc , ' new video source ', 'previous video sourc', prevVideoSrc);
            // if(MesiboCall.MESIBOCALL_VIDEOSOURCE_SCREEN == newVideoSrc
            //       && MesiboCall.MESIBOCALL_VIDEOSOURCE_CAMERAFRONT == prevVideoSrc){
            //       // The publisher has switched to streaming their screen, 
            //       // Previously they were streaming from their camera
            //       ... 
            // }
      
      }
      
}