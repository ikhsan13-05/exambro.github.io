const API_URL = import.meta.env.VITE_API_URL;

async function postData(action, payload = {}) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action,
        ...payload,
      }),
    });

    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: "Gagal terhubung ke server",
      error: error.message,
    };
  }
}

export const api = {
  getKelas: () => postData("getKelas"),

  validateLogin: ({ nama, kelas, token, deviceId }) =>
    postData("validateLogin", {
      nama,
      kelas,
      token,
      deviceId,
    }),

  heartbeatSession: ({ sessionId, deviceId }) =>
    postData("heartbeatSession", {
      sessionId,
      deviceId,
    }),

  recordViolation: ({ sessionId, jenis, detail }) =>
    postData("recordViolation", {
      sessionId,
      jenis,
      detail,
    }),

  finishExam: ({ sessionId }) =>
    postData("finishExam", {
      sessionId,
    }),

  getAdminSummary: ({ adminPin }) =>
    postData("getAdminSummary", {
      adminPin,
    }),

  verifyAdmin: ({ adminPin }) =>
    postData("verifyAdmin", {
      adminPin,
    }),

  getExamSettings: ({ adminPin }) =>
    postData("getExamSettings", {
      adminPin,
    }),

  saveExamSetting: ({ adminPin, form }) =>
    postData("saveExamSetting", {
      adminPin,
      form,
    }),

  deleteExamSetting: ({ adminPin, id }) =>
    postData("deleteExamSetting", {
      adminPin,
      id,
    }),

  getAdminKelas: ({ adminPin }) =>
    postData("getAdminKelas", {
      adminPin,
    }),

  saveKelas: ({ adminPin, form }) =>
    postData("saveKelas", {
      adminPin,
      form,
    }),

  deleteKelas: ({ adminPin, id }) =>
    postData("deleteKelas", {
      adminPin,
      id,
    }),

  getMonitoringData: ({ adminPin }) =>
    postData("getMonitoringData", {
      adminPin,
    }),

  getLockedSessions: ({ adminPin }) =>
    postData("getLockedSessions", {
      adminPin,
    }),

  unlockSession: ({ adminPin, sessionId }) =>
    postData("unlockSession", {
      adminPin,
      sessionId,
    }),

  resetSessionDevice: ({ adminPin, sessionId }) =>
    postData("resetSessionDevice", {
      adminPin,
      sessionId,
    }),

  resumeSession: ({ sessionId, deviceId }) =>
    postData("resumeSession", {
      sessionId,
      deviceId,
    }),

  getSessionViolations: ({ adminPin, sessionId }) =>
    postData("getSessionViolations", {
      adminPin,
      sessionId,
    }),

  cleanupOldSessions: ({
    adminPin,
    selesaiAfterDays = 7,
    berlangsungAfterHours = 12,
    terkunciAfterDays = 3,
  }) =>
    postData("cleanupOldSessions", {
      adminPin,
      selesaiAfterDays,
      berlangsungAfterHours,
      terkunciAfterDays,
    }),
};
