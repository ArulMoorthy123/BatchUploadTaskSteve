import * as moment from 'moment';

export function convertTimeFromNow(time: string) {
  var date = new Date(time),
      diff = (((new Date()).getTime() - date.getTime()) / 1000),
      daydiff = Math.floor(diff / 86400);

  if (isNaN(daydiff) || daydiff < 0 || daydiff >= 31)
      return '';

  return daydiff == 0 && (
      diff < 60 && "Just now" ||
      diff < 120 && "1 minute ago" ||
      diff < 3600 && Math.floor(diff / 60) + " minutes ago" ||
      diff < 7200 && "1 hour ago" ||
      diff < 86400 && Math.floor(diff / 3600) + " hours ago") ||
      daydiff == 1 && "Yesterday" ||
      daydiff < 7 && daydiff + " days ago" ||
      daydiff < 31 && Math.ceil(daydiff / 7) + " week(s) ago";
}

export function isGroup(user:any={}){
    if(typeof user == 'object') {
        return user.groupid;
    } 
}
export function isEmptyObj(obj) {
    if (obj && typeof obj === 'object') {
    return Object.getOwnPropertyNames(obj).length == 0;
    }else {
        return true;
    }
}  