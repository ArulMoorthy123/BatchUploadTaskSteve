
export interface userOption {
  username: string;
  password: string;
}
export interface UserData {
  name: string;
  groupid?: number;
  address? :any;
  qbid? :any;
  token ? :any;
  profileImageUrl? : string;
}

export class callInfo {
  UserData? :UserData
  initiator ?: boolean
}