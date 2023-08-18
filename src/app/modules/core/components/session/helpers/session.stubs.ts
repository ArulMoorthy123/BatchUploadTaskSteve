export const sessionData = [
  {
    id: '1',
    title: 'Session Meetup',
    desc: 'this session is to review testing resume for an employee x',
    dueDate: '12/07/2020',
    created_by: { name: 'Daniel', id: '123' },
    created_on: '12/01/2020',
    assigned_to: [{ name: 'Daniel', id: '123' }],
    modified_on: '12/10/2020',
    session_link:
      'https://docs.google.com/document/d/19wB6U6fxqU1UlXsVya7bHsJ1XY7gdgEKNrE4eXcGMRo/edit',
    time_zone: 'India +5:30',
  },
  {
    id: '2',
    title: 'Session Mockup',
    desc: 'this session is to review testing resume for an employee x',
    dueDate: '12/07/2020',
    created_by: { name: 'Daniel', id: '123' },
    created_on: '12/01/2020',
    assigned_to: [{ name: 'Daniel', id: '123' }],
    modified_on: '12/10/2020',
    session_link:
      'https://docs.google.com/document/d/19wB6U6fxqU1UlXsVya7bHsJ1XY7gdgEKNrE4eXcGMRo/edit',
    time_zone: 'India +5:30',
  },
  {
    id: '2',
    title: 'Session Release',
    desc: 'this session is to review testing resume for an employee x',
    dueDate: '12/07/2020',
    created_by: { name: 'Daniel', id: '123' },
    created_on: '12/01/2020',
    assigned_to: [{ name: 'Daniel', id: '123' }],
    modified_on: '12/10/2020',
    session_link:
      'https://docs.google.com/document/d/19wB6U6fxqU1UlXsVya7bHsJ1XY7gdgEKNrE4eXcGMRo/edit',
    time_zone: 'India +5:30',
  },
];

export const sessionStub = {
  sessions: [
    {
      id: '1',
      title: 'DB design',
      desc: 'Discussion related to CJ session DB',
      starts: '03/19/2021',
      ends: '03/19/2021',
      status: 'WILL_START',
      uri: '/maybe/messibo/id/link',
      members: [
        {
          id: '12345',
          name: 'Vinoth',
        },
      ],
      recordings: [
        {
          id: 'recording_id',
          path: '/recording_id.mov',
        },
      ],
      messages: [
        {
          id: 'messages_id',
          path: '/messages_id.json',
        },
      ],
      created_by: {
        id: '123',
        name: 'Daniel',
      },
      created_at: 'date_time',
      Timezone: 'IST',
    },
    {
      id: '2',
      title: 'Session module design',
      desc: 'Discussion related to CJ session module',
      starts: '03/19/2021',
      ends: '03/19/2021',
      status: 'STARTED',
      uri: '/maybe/messibo/id/link',
      members: [
        {
          id: '12345',
          name: 'Vinoth',
        },
      ],
      recordings: [
        {
          id: 'recording_id',
          path: '/recording_id.mov',
        },
      ],
      messages: [
        {
          id: 'messages_id',
          path: '/messages_id.json',
        },
      ],
      created_by: {
        id: '123',
        name: 'Daniel',
      },
      created_at: 'date_time',
      Timezone: 'IST',
    },
  ],
};

export function getSessionStub() {
  return sessionData;
}

export function getSessionById(id) {
  return sessionData[id - 1];
}
