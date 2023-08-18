import { Person } from "../../../session/helpers/session.dto";

export class QbUsers {
  user_id?: any;
  token?: string;
}

export class videoStatus {
  isAudioOnly?: boolean;
  onCalling?: boolean;
  participantId: [];
  callAccept: boolean;
  dialogue_id: any;
  roomId: any;
  type?: any;
  callIsInProgress?: boolean;
  callInitiator: boolean;
}


export class connection {
  qbid: number;
  connectionDate ?: any;
  email : string;
  firstName? :string;
  lastName? :string;
  userId :number;
  tillDate :any;
  profileImageUrl? :any;
}

export class conference {
  groupid :string
  title :string
  type :string
  description? :string
  initiator ? :boolean
  host? :string
  hostUserId? :string
  email? : string
  name? : string
  callStatus? : string
  members ? : Person[]
  id? :any
}

