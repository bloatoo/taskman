function getTime(datetime: string): string {
  return datetime.split("T")[1];
}

function getDate(datetime: string): string {
  return datetime.split("T")[0]
}

function isToday(date: string): boolean {
  let other = getDate(new Date().toISOString());
  return date === other;
}

function formatTimeHm(time: string): string {
  let [m, s] = time.split(":");
  return [m, s].join(":");
}

function formatDate(date: string): string {
  let days = daysSince(date);

  if(days == 0) {
    return "Today";
  } else if(days == 1) {
    return "Yesterday";
  } else {
    return `${days} days ago`;
  }
}

function formatDeadline(datetime: string): string {
  let [date, time] = datetime.split("T");
  let days = daysTill(date);

  if(days == 0) {
    let minutes = minutesTill(datetime);
    if(minutes <= 60) {
      return `In ${minutesTill(datetime)} minutes`;
    } else {
      return `In ${Math.floor(minutes / 60)} hours`;
    }
  } else if(days == 1) {
    return `Tomorrow at ${formatTimeHm(time)}`;
  } else {
    return `In ${days} days at ${formatTimeHm(time)}`;
  }
}


function daysSince(start: string) {
  const date1 = new Date(start);
  const date2 = Date.now();

  const diff = date2 - date1.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24) - 1)
}

function daysTill(start: string) {
  const date1 = new Date(start);
  const date2 = Date.now();

  const diff = date1.getTime() - date2;
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function minutesTill(start: string) {
  const date1 = new Date(start).getTime();
  const date2 = Date.now();

  const diff = date1 - date2;

  return Math.ceil(diff / (1000 * 60));
}

export {
  getTime,
  getDate,
  isToday,
  formatTimeHm,
  daysSince,
  daysTill,
  formatDate,
  formatDeadline,
  minutesTill
}
