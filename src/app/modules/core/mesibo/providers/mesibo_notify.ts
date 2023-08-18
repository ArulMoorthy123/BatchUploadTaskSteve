import { Subscription, bindCallback } from 'rxjs';
declare var scope: any;
declare const MESIBO_MSGSTATUS_EXPIRED;
export class Notify {
      public scope: any;
      constructor(scope) {
            globalThis.scope = scope;
      }



      public Mesibo_OnConnectionStatus(status, value) {
            console.log("TestNotify.prototype.Mesibo_OnConnectionStatus: ", status, value);
            let res = { status: status, value: value };
            globalThis.scope.connectionStatus = status,
                  globalThis.scope.notifyListenersData("CONNECTION", status, value);
      }

      public Mesibo_OnMessageStatus = function (m) {
            console.log("public Mesibo_OnMessageStatus: from " + m.peer + " status: " + m.status);
            globalThis.scope.notifyListenersData("MESSAGE_STATUS", m, true);
      }

      // You will receive messages here
      public Mesibo_OnMessage = function (m, data) {
            console.log("public Mesibo_OnMessage: from " + m.peer, " data ", data);
            console.log("public Mesibo_OnMessage: from ", m);
            let res = m;
            globalThis.scope.notifyListenersData("ON_MESSAGE", res, true);
            if (data == "ON_CALL" && m.status != MESIBO_MSGSTATUS_EXPIRED)
                  globalThis.scope.notifyListenersData("ON_CALL", res, true);
      }

      // You will receive calls here
      public Mesibo_OnCall = function (callid, from, video) {
            console.log("Mesibo_OnCall: " + callid + " " + from + " " + video);
            let data = { callid: callid, from: from, video: video };
            globalThis.scope.notifyListenersData("ON_CALL", data, video);
      }

      // You will receive calls here
      public Mesibo_OnActivity = function (m, activity) {
            console.log("Mesibo_OnActivity: " + m, " " + activity);
            let data = { message: m, activity: activity };
            globalThis.scope.notifyListenersData("ON_ACTIVITY", data, true);
      }


      // You will receive call status here
      public Mesibo_OnCallStatus = function (callid, status) {
            console.log("Mesibo_onCallStatus: " + callid + " " + status);
            let data = { callid: callid, status: status };
            globalThis.scope.notifyListenersData("ON_CALL_STATUS", data, status);
      }

      //get notification of permission call like camera access and screen ,audio
      public Mesibo_OnPermission(on) {
            console.log('Permission ask ' + on);
            globalThis.scope.notifyListenersData("PERMISSION", on, true);
      }

      // You will get Notification Update participant in conference
      // public MesiboGroupcall_OnPublisher = function (all, latest) {
      //       console.log("Mesibo_OnParticipants: ", all, " ", latest);
      //       globalThis.scope.notifyListenersData("ON_PARTICIPANT", { all: all, latest: latest }, true);

      // }
      // //get notification about update participabt like mutte/unmute talking
      public Mesibo_OnParticipantUpdated = function (all, latest) {
            console.log("Mesibo_OnParticipantUpdated: ", all, " ", latest);
            globalThis.scope.notifyListenersData("ON_PARTICIPANT_UPDATE", { all: all, latest: latest }, true);
      }
      public Mesibo_OnLocalMedia = function (m) {
            console.log("Mesibo_OnLocalMediaUpdated: ");
            globalThis.scope.notifyListenersData("ON_LOCAL_MEDIA_UPDATE", m, true);
      }

}