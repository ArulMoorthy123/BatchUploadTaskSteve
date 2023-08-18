
export interface Session {
  id: string;
  title: string;
  desc: string;
  ends: string;
  members:Person[];
  recordings: file[];
  messages:file[];
  created_by: Person;
  status: string;
  starts: string;
  uri: string;
  created_at: string;
  timeZone :string;
}

export class Person {
  name: string;
  id: string;
  userId? : string;
  fullName? :string;
  qbid? :any;
}
export class file {
  name: string;
  id: string;
  path: string;
  type:string;
}

