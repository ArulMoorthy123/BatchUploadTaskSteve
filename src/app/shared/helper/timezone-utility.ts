import * as moment from 'moment';
import * as momentTZ from 'moment-timezone';
export function getTimeZoneData() {
  return momentTZ.tz.names();
}

export function getDateTime(date, time) {
  return moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm').utc().format();
}
export function utcDateConversion(cdate) {
  return moment.utc(cdate).format();
}

export function getTimeZoneToLocal(startDate, tm, format = 'LLL') {
  let aftcon=moment(startDate).tz(tm,true).format();
  return aftcon ? moment.utc(aftcon).format(format) : 'Not Available';
}

export function getFormattedDateTime(date) {
  return moment.utc(date).format('YYYY-MM-DDTHH:mm')
}

export function getFormattedTime(date) {
  return moment(date).format('HH:mm');
}

export function getCurrentTimezone() {
  return momentTZ.tz.guess();
}