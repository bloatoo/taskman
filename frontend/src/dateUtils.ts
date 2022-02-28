function isToday(date: string): boolean {
  let other = new Date().toISOString().split("T")[0];
  return date === other;
}

function formatTimeHm(time: string): string {
  let [m, s] = time.split(":");
  return [m, s].join(":");
}

export {
  isToday,
  formatTimeHm,
}
