import { environment } from "src/environments/environment";

export const QBCONFIG = {
  endpoints: {
    api: 'api.quickblox.com',
    chat: 'chat.quickblox.com',
    turnserver: 'turn.quickblox.com',
    muc: 'muc.chat.quickblox.com',
  },
  chatProtocol: {
    active: 2, // set 1 to use BOSH, set 2 to use WebSockets (default)
  },
  streamManagement: {
    enable: true
  },
  debug: { mode: environment.debug },
  webrtc: {
    answerTimeInterval: 30,
    dialingTimeInterval: 1,
    disconnectTimeInterval: 35,
    //incomingLimit: 1,
    statsReportTimeInterval: environment.debug,
  },
};
export const API_TIMEOUT_LIMIT = 40000;
export const qbPassword = 'password';
export const MESSAGE_LIMIT = 75;
export const qbAccount = {
  // appId: 74442,
  // authKey: 'pXFrRQMaBGmJUFb',
  // authSecret: 'TV-G55Huh62r2nf'
  appId: environment.production==true?88057 : 83428,
  authKey: environment.production ==true? 'BR3XKtPFZtxO5se' : 'zTFXtr89UrvneCA',
  authSecret: environment.production ==true?'7ENxedYHPtahODE': 'OVx34urCMDbV4Ju',
  accountKey : environment.production ==true?'r1L1Whve_btU8B6xwav3' : 'a3LURDBKXoYPBh1am4Ge'
};
export const AUDIO_CALL_ENABLE =false;

export const MULTIPART_SERVER = 'wss://janus.quickblox.com:8989';

export const VIDEO_RESOLUTION = {
  LOW: 'lowres', //(320x240)
  STANDARED: 'stdres', // (640x480),
  HD: 'hdres', // (1280x720),
  FULL_HD: 'fhdres', // (1920x1080)
};
export const CALLSTATUS = {
  ONCALL: 1,
  STOPCALL: 2,
  CALLING: 3,
};

export const QB_CONNECTION_STATUS ={
  CONNECTED : 'connected',
  DISCONNECT : 'disconnect',
  CONNECTING : 'connecting',
  NEED_AUTH : 'needAuth',
  LOGGED_OUT : 'loggedOut',
  OFFLINE : 'offline',
  LOGGED_IN :'loggedIn',
  NOT_INITIALIZED : 'not_initialized',
  NOT_YET_LOGGED_IN : 'not_yet_login'
}

export const QBCONSTAND = {
  DIALOG_TYPES: {
    CHAT: 3,
    GROUPCHAT: 2,
    PUBLICCHAT: 1,
  },
  ATTACHMENT: {
    TYPE: 'image',
    BODY: '[attachment]',
    MAXSIZE: 1 * 1000000, // set 2 megabytes,
    MAXSIZEMESSAGE: 'Image is too large. Max size is 1 mb.',
    MAX_VIDEO_SIZE: 20 * 1000000, // set 2 megabytes,
    MAX_VIDEO_SIZE_MESSAGE: 'Video is too large. Max size is 20 mb.',
    MAX_AUDIO_SIZE: 5 * 1000000, // set 2 megabytes,
    MAX_AUDIO_SIZE_MESSAGE: 'Video is too large. Max size is 5 mb.',
    MAX_FILE_SIZE: 10 * 1000000, // set 2 megabytes,
    MAX_FILE_SIZE_MESSAGE: 'File is too large. Max size is 10 mb.',
  },
  NOTIFICATION_TYPES: {
    NEW_DIALOG: 1,
    CHANGE_NAME_DIALOG: 2,
    ADD_NEW_USER_DIALOG: 3,
    LEAVE_DIALOG: 4,
    START_CONF_VIDEO_CALL: 5,
    START_CONF_AUDIO_CALL: 6,
    DROP_CONF_CALL: 7,
    STOP_CONF_CALL: 8,
    REMOVE_DIALOG_BY_SOMEONE: 9,
    DELETE_GROUP: 10,
    UPDATE_DIALOG: 11,
    MISSED_CALL :12,
    CALL_REPORT :13,
    DELIVERY_MESSAGE:14,
    PRIVATE_CALL_RINGING:15,
    SESSION_CALL_START:16,
    SESSION_CALL_END:17
  },
};


export const MODAL_ID={
  PRIVATE_CALL:12,
  CONFERENCE_CALL : 13,
  VIEW_SESSION:14,
  SESSION_PARTICIPANT:15
}
