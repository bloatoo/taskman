function isToday(date: string): boolean {
  let other = new Date().toISOString().split("T")[0];
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

/*function daysSince(date: string): number {
  let [y, m, d] = date.split("-").map(x => parseInt(x, 10));
  console.log(y, m, d);

  let old = new Date(y, m, d).getTime();

  let current = new Date().getTime();

  console.log(old, current);

  return Math.ceil((current - old) / 8.64e7);
}*/

function daysSince(start: string) {
    const date1 = new Date(start);
    const date2 = Date.now();

    const diff = date2 - date1.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
}

export {
  isToday,
  formatTimeHm,
  daysSince,
  formatDate
}
