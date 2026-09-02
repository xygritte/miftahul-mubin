export type NewsItem = {
  slug: string
  category: string
  title: string
  date: string
  image: string
  excerpt: string
  content: string[]
  publishedAt?: string | null
  viewCount?: number
}

export type EventItem = {
  slug: string
  day: string
  month: string
  date: string
  title: string
  time: string
  place: string
  category: string
  description: string
}

export const news: NewsItem[] = [
  { slug: 'kajian-akbar-miftahul-mubin', category: 'Kegiatan Masjid', title: 'Miftahul Mubin Gelar Kajian Akbar untuk Jamaah dan Warga Sekitar', date: '30 Agustus 2026', image: 'https://images.unsplash.com/photo-1542816417-0983676b0c9f?auto=format&fit=crop&w=1400&q=82', excerpt: 'Kajian akbar menjadi ruang silaturahmi, pembelajaran, dan penguatan semangat kebersamaan jamaah.', content: ['Miftahul Mubin kembali menyelenggarakan kajian akbar yang terbuka untuk jamaah dan masyarakat sekitar. Kegiatan ini dirancang sebagai ruang belajar bersama sekaligus mempererat silaturahmi antarwarga.', 'Rangkaian kegiatan mencakup pembukaan, penyampaian materi, sesi tanya jawab, dan penutup. Pengurus juga menyiapkan area pelayanan jamaah agar kegiatan berlangsung tertib dan nyaman.', 'Melalui agenda seperti ini, masjid diharapkan terus menjadi ruang bertumbuhnya ilmu, kepedulian, dan hubungan sosial yang baik.'] },
  { slug: 'menjaga-ukhuwah-di-tengah-kesibukan', category: 'Keislaman', title: 'Menjaga Ukhuwah di Tengah Kesibukan Kehidupan', date: '28 Agustus 2026', image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1100&q=82', excerpt: 'Kesibukan tidak seharusnya menghilangkan ruang untuk menjaga hubungan baik dengan sesama.', content: ['Ukhuwah membutuhkan perhatian yang konsisten. Di tengah ritme kehidupan yang semakin padat, kebiasaan menyapa, membantu, dan menjaga adab menjadi bagian penting dalam membangun lingkungan yang sehat.', 'Masjid dapat menjadi titik temu yang mempertemukan berbagai latar belakang jamaah dalam suasana ibadah dan kebersamaan.', 'Kebiasaan sederhana yang dijaga bersama dapat membentuk budaya saling menghormati dan membantu di lingkungan masyarakat.'] },
  { slug: 'program-santunan-miftahul-mubin', category: 'Sosial', title: 'Program Santunan Miftahul Mubin Kembali Digelar', date: '26 Agustus 2026', image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1100&q=82', excerpt: 'Program sosial menjadi bagian dari pelayanan masjid untuk memperkuat kepedulian terhadap masyarakat.', content: ['Program santunan kembali dilaksanakan dengan melibatkan pengurus, relawan, dan jamaah. Bantuan disiapkan untuk penerima manfaat yang telah didata sebelumnya.', 'Kegiatan sosial diharapkan tidak berhenti pada pemberian bantuan, tetapi berkembang menjadi kerja bersama yang berkelanjutan.', 'Pengurus membuka ruang partisipasi bagi jamaah yang ingin terlibat melalui tenaga, waktu, maupun dukungan program.'] },
  { slug: 'pendaftaran-relawan-kegiatan-sosial', category: 'Pengumuman', title: 'Pendaftaran Relawan Kegiatan Sosial Masjid Dibuka', date: '24 Agustus 2026', image: 'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=1100&q=82', excerpt: 'Miftahul Mubin membuka kesempatan bagi jamaah untuk terlibat dalam kegiatan pelayanan sosial.', content: ['Pendaftaran relawan dibuka bagi jamaah dan masyarakat yang ingin membantu kegiatan sosial masjid. Relawan dapat memilih bidang sesuai waktu dan kemampuan yang tersedia.', 'Panitia akan memberikan pengarahan sebelum kegiatan berlangsung agar pembagian tugas berjalan jelas dan tertib.', 'Informasi pendaftaran akan diperbarui melalui kanal resmi Miftahul Mubin.'] },
  { slug: 'kelas-al-quran-anak-remaja', category: 'Pendidikan', title: 'Kelas Al-Qur’an untuk Anak dan Remaja Dimulai September', date: '22 Agustus 2026', image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1100&q=82', excerpt: 'Program pendidikan Al-Qur’an disiapkan sebagai ruang belajar yang rutin dan dekat dengan anak serta remaja.', content: ['Program kelas Al-Qur’an akan dimulai pada September dengan pembagian kelompok berdasarkan usia dan kemampuan dasar peserta.', 'Kegiatan diarahkan untuk membangun kebiasaan belajar, membaca dengan baik, dan mencintai Al-Qur’an sejak dini.', 'Pengurus mengundang orang tua untuk mendukung keberlanjutan pembelajaran anak di rumah.'] },
  { slug: 'persiapan-fasilitas-masjid-akhir-bulan', category: 'Masjid', title: 'Persiapan Fasilitas Masjid Menjelang Agenda Akhir Bulan', date: '20 Agustus 2026', image: 'https://images.unsplash.com/photo-1594156596782-656c93e4d504?auto=format&fit=crop&w=1100&q=82', excerpt: 'Persiapan fasilitas dilakukan untuk menjaga kenyamanan jamaah selama rangkaian agenda masjid.', content: ['Pengurus melakukan pemeriksaan fasilitas utama menjelang sejumlah agenda akhir bulan. Fokus pemeriksaan meliputi kebersihan, ruang kegiatan, dan perlengkapan yang digunakan jamaah.', 'Perawatan rutin diperlukan agar fasilitas tetap aman, bersih, dan siap digunakan.', 'Jamaah dapat menyampaikan masukan terkait fasilitas kepada pengurus melalui kanal komunikasi resmi.'] },
]

export const events: EventItem[] = [
  { slug: 'kajian-rutin-kamis-03-september-2026', day: '03', month: 'SEP', date: 'Kamis, 3 September 2026', title: 'Kajian Rutin Kamis', time: '19.30 WIB', place: 'Aula Masjid Miftahul Mubin', category: 'Kajian', description: 'Kajian rutin mingguan untuk jamaah dan masyarakat sekitar.' },
  { slug: 'santunan-yatim-dhuafa-05-september-2026', day: '05', month: 'SEP', date: 'Sabtu, 5 September 2026', title: 'Santunan Yatim & Dhuafa', time: '09.00 WIB', place: 'Halaman Masjid', category: 'Sosial', description: 'Kegiatan santunan dan silaturahmi bersama penerima manfaat.' },
  { slug: 'kajian-ahad-pagi-07-september-2026', day: '06', month: 'SEP', date: 'Minggu, 6 September 2026', title: 'Kajian Ahad Pagi', time: '07.30 WIB', place: 'Ruang Utama Masjid', category: 'Kajian', description: 'Kajian pagi setelah rangkaian ibadah dan kebersamaan jamaah.' },
  { slug: 'kelas-al-quran-anak-10-september-2026', day: '10', month: 'SEP', date: 'Kamis, 10 September 2026', title: 'Kelas Al-Qur’an Anak', time: '16.00 WIB', place: 'Ruang Pendidikan', category: 'Pendidikan', description: 'Kelas pembelajaran Al-Qur’an untuk anak dan remaja.' },
  { slug: 'rapat-pengurus-bulanan-14-september-2026', day: '14', month: 'SEP', date: 'Senin, 14 September 2026', title: 'Rapat Pengurus Bulanan', time: '19.30 WIB', place: 'Ruang Sekretariat', category: 'Pengurus', description: 'Evaluasi program dan koordinasi kegiatan bulan berikutnya.' },
  { slug: 'bakti-sosial-lingkungan-20-september-2026', day: '20', month: 'SEP', date: 'Minggu, 20 September 2026', title: 'Bakti Sosial Lingkungan', time: '08.00 WIB', place: 'Lingkungan Masjid', category: 'Sosial', description: 'Kegiatan gotong royong dan pelayanan lingkungan sekitar masjid.' },
]
