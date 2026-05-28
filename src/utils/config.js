export const APP_CONFIG = {
  appName: "ExamBrowser",
  appTagline: "Ujian Online Aman dan Terkontrol",

  schoolName: "UPT SPF SMPN 8 Makassar",
  schoolShortName: "Sekolah",
  schoolAddress: "Alamat sekolah",
  academicYear: "2026/2027",

  logoUrl: "/logo.png",

  footerText: "ExamBrowser Sekolah",
  developerText: "Powered by Admin Sekolah",

  colors: {
    primary: "indigo",
    secondary: "sky",
  },

  examRules: [
    {
      type: "secure",
      title: "Tetap di Halaman Ujian",
      desc: "Siswa tidak diperbolehkan keluar dari halaman ujian atau berpindah tab/browser.",
    },
    {
      type: "warning",
      title: "Pelanggaran Tercatat Otomatis",
      desc: "Shortcut terlarang, keluar fullscreen, dan aktivitas mencurigakan akan tercatat oleh sistem.",
    },
    {
      type: "education",
      title: "Kirim Jawaban Google Form",
      desc: "Pastikan jawaban sudah dikirim sebelum menekan tombol selesai ujian.",
    },
    {
      type: "online",
      title: "Gunakan Perangkat yang Sama",
      desc: "Login di perangkat/browser lain dapat menyebabkan sesi ditolak atau terkunci.",
    },
  ],
};
