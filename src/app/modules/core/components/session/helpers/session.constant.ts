export const SORT = {
  ASC: 'asc',
  DESC: 'desc',
  BY: 'starts',
};

export const SESSION_LIST = ['ACTIVE', 'ARCHIVE', 'CANCELED'];

export const SESSION_STATUS = {
  WILL_START: 'WILL_START',
  STARTED: 'STARTED',
  FINISHED: 'FINISHED',
  CANCELED: 'CANCELED',
};

export const SESSION_FILTER = {
  WILL_START: 'Upcoming',
  STARTED: 'On Going',
  FINISHED: 'Completed',
  CANCELED: 'Canceled',
};

export const SESSION_MESSAGES = {
  ADD_SUCCESS: 'Session successfully created!',
  UPDATE_SUCCESS: 'Session successfully updated!',
  DELETE_SUCCESS: 'Session successfully deleted!',
  REQUIRED_ERROR: 'Some required field(s) is empty!',
  COMMON_ERROR: 'Sorry! There is a problem. Please try again later.',
  SESSION_EMPTY: 'Looks like you have no sessions!',
};

export const SESSION_TIME = {
  DURATION: {
    0: 'Duration',
    30: '30 Mins',
    60: '1 Hour',
    90: '1.5 Hour',
    120: '2 Hour',
  },
};


export const TIMEZONE = [
  { offset: '-11:00', label: '(GMT-11:00) Pago Pago', code: 'Pacific/Pago_Pago' },
  { offset: '-10:00', label: '(GMT-10:00) Hawaii Time', code: 'Pacific/Honolulu' },
  { offset: '-10:00', label: '(GMT-10:00) Tahiti', code: 'Pacific/Tahiti' },
  { offset: '-09:00', label: '(GMT-09:00) Alaska Time', code: 'America/Anchorage' },
  { offset: '-08:00', label: '(GMT-08:00) Pacific Time', code: 'America/Los_Angeles' },
  { offset: '-07:00', label: '(GMT-07:00) Mountain Time', code: 'America/Denver' },
  { offset: '-06:00', label: '(GMT-06:00) Central Time', code: 'America/Chicago' },
  { offset: '-05:00', label: '(GMT-05:00) Eastern Time', code: 'America/New_York' },
  { offset: '-04:00', label: '(GMT-04:00) Atlantic Time - Halifax', code: 'America/Halifax' },
  { offset: '-03:00', label: '(GMT-03:00) Buenos Aires', code: 'America/Argentina/Buenos_Aires' },
  { offset: '-02:00', label: '(GMT-02:00) Sao Paulo', code: 'America/Sao_Paulo' },
  { offset: '-01:00', label: '(GMT-01:00) Azores', code: 'Atlantic/Azores' },
  { offset: '+00:00', label: '(GMT+00:00) London', code: 'Europe/London' },
  { offset: '+01:00', label: '(GMT+01:00) Berlin', code: 'Europe/Berlin' },
  { offset: '+02:00', label: '(GMT+02:00) Helsinki', code: 'Europe/Helsinki' },
  { offset: '+03:00', label: '(GMT+03:00) Istanbul', code: 'Europe/Istanbul' },
  { offset: '+04:00', label: '(GMT+04:00) Dubai', code: 'Asia/Dubai' },
  { offset: '+04:30', label: '(GMT+04:30) Kabul', code: 'Asia/Kabul' },
  { offset: '+05:00', label: '(GMT+05:00) Maldives', code: 'Indian/Maldives' },
  { offset: '+05:30', label: '(GMT+05:30) India Standard Time', code: 'Asia/Calcutta' },
  { offset: '+05:45', label: '(GMT+05:45) Kathmandu', code: 'Asia/Kathmandu' },
  { offset: '+06:00', label: '(GMT+06:00) Dhaka', code: 'Asia/Dhaka' },
  { offset: '+06:30', label: '(GMT+06:30) Cocos', code: 'Indian/Cocos' },
  { offset: '+07:00', label: '(GMT+07:00) Bangkok', code: 'Asia/Bangkok' },
  { offset: '+08:00', label: '(GMT+08:00) Hong Kong', code: 'Asia/Hong_Kong' },
  { offset: '+08:30', label: '(GMT+08:30) Pyongyang', code: 'Asia/Pyongyang' },
  { offset: '+09:00', label: '(GMT+09:00) Tokyo', code: 'Asia/Tokyo' },
  { offset: '+09:30', label: '(GMT+09:30) Central Time - Darwin', code: 'Australia/Darwin' },
  { offset: '+10:00', label: '(GMT+10:00) Eastern Time - Brisbane', code: 'Australia/Brisbane' },
  { offset: '+10:30', label: '(GMT+10:30) Central Time - Adelaide', code: 'Australia/Adelaide' },
  { offset: '+11:00', label: '(GMT+11:00) Eastern Time - Melbourne, Sydney', code: 'Australia/Sydney' },
  { offset: '+12:00', label: '(GMT+12:00) Nauru', code: 'Pacific/Nauru' },
  { offset: '+13:00', label: '(GMT+13:00) Auckland', code: 'Pacific/Auckland' },
  { offset: '+14:00', label: '(GMT+14:00) Kiritimati', code: 'Pacific/Kiritimati' }
];
