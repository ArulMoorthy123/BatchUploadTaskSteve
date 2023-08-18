
export interface Plans {
  id: string;
  title: string;
  desc: string;
  dueDate: string;
  status: string;
  created_by: Person;
  created_on: string;
  assigned_to: Person;
  sharedDoc_link: string;
  tag: [];
  comments: Comment[];
  modified_on: string;
}

export class Person {
  name: string;
  id: string;
}

export class Comment {
  comment: string;
  attachments: Attachment[];
  created_by: Person;
  created_on: string;
}

export class Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
}
