const DAYS_OF_WEEK = {
  weekdays: [1,2,3,4,5],
  saturday: [6],
  sunday: [0]
};

const DAYS_FROM_DB = {
  weekdays: 1,
  saturday: 2,
  sunday: 3
}

export function getDateTime() {
    const date = new Date();

    let hour: any = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    let min: any = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    let sec: any = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return hour + ":" + min + ":" + sec;
}

export function diffTime(start, end) {
    start = start.split(":");
    end = end.split(":");
    const startDate = new Date(0, 0, 0, start[0], start[1], start[2]);
    const endDate = new Date(0, 0, 0, end[0], end[1], end[2]);
    let diff = endDate.getTime() - startDate.getTime();
    let hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / 1000 / 60);
    diff -= minutes * 1000 * 60;
    const seconds = Math.floor(diff / 1000);
    // If using time pickers with 24 hours format, add the below line get exact hours
    if (hours < 0)
       hours = hours + 24;

    return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes + ":" + (seconds <= 9 ? "0" : "") + seconds;
}

export function timeToSeconds(time) {
    const timeSplit = time.split(':'); // split it at the colons
    return (+timeSplit[0]) * 60 * 60 + (+timeSplit[1]) * 60 + (+timeSplit[2]); 
}

export function isUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

export function getDay() {
  let dayToReturn;
  let currentDay = new Date().getDay()
  Object.keys(DAYS_OF_WEEK).forEach(async (key, index) => {
    const daysOfWeek = DAYS_OF_WEEK[key];

    if (daysOfWeek.includes(currentDay)) {
      dayToReturn = DAYS_FROM_DB[key]
    }
  });
  return dayToReturn;
}

export default {}