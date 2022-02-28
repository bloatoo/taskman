function isToday(date: string): boolean {
  let other = new Date().toISOString().split("T")[0];
  return date == other;
}

function formatTimeHm(time: string): string {
  let hms = time.split(".")[0];
  let [m, s] = time.split(":");
  console.log(time);
  return [m, s].join(":");
}

export {
  isToday,
  formatTimeHm,
}
