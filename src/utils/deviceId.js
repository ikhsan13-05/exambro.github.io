export function getOrCreateDeviceId() {
  const key = "examDeviceId";

  let deviceId = localStorage.getItem(key);

  if (!deviceId) {
    deviceId =
      "DEV-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 12).toUpperCase();

    localStorage.setItem(key, deviceId);
  }

  return deviceId;
}