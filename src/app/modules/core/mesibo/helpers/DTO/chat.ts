
export interface chat {
  name:string;
  address: string;
  groupid : string;
  ts :number;
  lastMessage: message;
}
export interface message {
  groupid: number;
  peer : string;
  status :number;
  ts :number;
  type : number;
  refid : number;
  origin :number;
  message : string;
  flag : number;
  id: number;
}
export interface chatList extends Array<chat> { }

export class callInfo {
  groupid: number;
  name : string;
  startTime : number;
  totalParticipant : number;
  totalStream :number;
  callId :number;
  //initiator : number;
}
