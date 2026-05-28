export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function minutesToSeconds(minutes) {
  return Number(minutes || 0) * 60;
}