export function blockUnsafeKeys(e) {
  const key = e.key.toLowerCase();

  if (
    key === "f12" ||
    (e.ctrlKey && key === "u") ||
    (e.ctrlKey && key === "s") ||
    (e.ctrlKey && key === "p") ||
    (e.ctrlKey && e.shiftKey && key === "i") ||
    (e.ctrlKey && e.shiftKey && key === "j") ||
    (e.ctrlKey && e.shiftKey && key === "c")
  ) {
    e.preventDefault();
    return true;
  }

  return false;
}

export function preventDefaultEvent(e) {
  e.preventDefault();
}