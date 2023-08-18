export class AppConstServ {
  public static DATE_FORMAT = 'DD-MM-YYYY';
  public static CSRF_TOKEN = 'ATSJ-XRF-TOKEN';
  static CHAT_PROVIDER = 'QB';
  static DEFAULT_PROFILE_URL = 'assets/images/avatar.png';
  static DEFAULT_GROUP_IMAGE_URL = 'assets/images/grp-avatar.png';
  public static GENDER = [
    {id: 1, name: 'Male'},
    {id: 2, name: 'FeMale'},
  ];
  public static URL_ENCRYPT_KEY = '1234567890PQRSTASUBNFGTREashkgfarwuweoopp';

  public static URL_OBJ = {
    LOGIN: { url: '/login', title: 'Login', desc: '' },
    FORGOT_PASSWORD: { url: '/forgotpassword', title: 'Forgot Password', desc: '', },
    RESET_PASSWORD: { url: '/reset', title: 'Reset Password', desc: '' },
    UPDATE_PASSWORD: { url: '/update', title: 'Update Password', desc: '' },
    DASHBOARD: { url: '/content', title: 'Home', desc: '' },
    PROFILE: { url: '/profile', title: 'Profile', desc: '' },
    REGISTER: { url: '/register', title: 'Register', desc: '' },
    SESSION: { url: '/session', title: 'Sessions', desc: '' },
    MESSAGE: { url: '/message', title: 'Messages', desc: '' },
    CONNECTION: { url: '/connection', title: 'Connections', desc: '' },
    GROUP: { url: '/group', title: 'Groups', desc: '' },
    CONFERENCE: { url: '/conferenceRoom', title: 'Conference', desc: '' },
    VIDEO_CALL: { url: '/videoCall', title: 'Video Call', desc: '' },
    VIEW_PROFILE: { url: '/viewprofile', title: 'View Profile', desc: '' },
    USER_POST: { url: '/userpost', title: 'Posts', desc: '' },
    VIEW_USER_POST: { url: '/viewuserpost', title: 'View Post', desc: '' },
    HOME: { url: '/', title: 'Home', desc: '' },
    ABOUT: { url: '/about', title: 'About', desc: '' },
    CONTACT: { url: '/contact', title: 'Contact', desc: '' },
    PRIVACY: { url: '/privacy-policy', title: 'Privacy', desc: '' },
    TERMS: { url: '/terms', title: 'Terms & Conditions', desc: '' },
    PLANS: { url: 'plans', title: 'Plans', desc: '' },
    PAGENOTFOUND: { url: '/pagenotfound', title: 'pagenotfound', desc: '' },
  };

  static REG_EX = {
    TAG: /^[a-zA-Z0-9_]{3,15}$/,
    URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    TIME: /^([0]?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i,
  };
}
