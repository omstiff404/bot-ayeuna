const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'listisPrem',
  command: ['listprem', 'listisPremium'],
  tags: 'Info Menu',
  desc: 'Menampilkan daftar pengguna isPremium.',
  prefix: true,
  owner: true,

  run: async (conn, msg, { chatInfo }) => {
    try {
      const { chatId } = chatInfo;
      if (!(await isOwner(module.exports, conn, msg))) return;

      const dbPath = path.join(__dirname, '../../toolkit/db/database.json');
      if (!fs.existsSync(dbPath)) {
        return conn.sendMessage(chatId, { text: 'Database tidak ditemukan.' }, { quoted: msg });
      }

      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      const data = db?.Private;

      if (!data || typeof data !== 'object') {
        return conn.sendMessage(chatId, { text: 'Data Private tidak valid.' }, { quoted: msg });
      }

      const list = Object.entries(data)
        .filter(([_, d]) => d.isPremium?.isPrem)
        .map(([_, d]) => ({
          name: d.Nama || '-',
          num: d.Nomor,
          time: d.isPremium.time
        }));

      if (!list.length) {
        return conn.sendMessage(chatId, { text: 'Tidak ada pengguna premium.' }, { quoted: msg });
      }

      let teks = `${head}${Obrack} Daftar Pengguna Premium${Cbrack}\n`;
      list.forEach((u, i) => {
        let sisa = u.time;
        let waktu = 'Expired';

        if (sisa > 0) {
          const d = Math.floor(sisa / 86400000);
          sisa %= 86400000;
          const h = Math.floor(sisa / 3600000);
          sisa %= 3600000;
          const m = Math.floor(sisa / 60000);
          waktu = `${d}h ${h}j ${m}m`;
        }

        teks += `${side}${btn} ${i + 1}. wa.me/${u.num.replace('@s.whatsapp.net', '')} (${waktu})\n`;
      });
      teks += `${side}${btn} Total: ${list.length}\n`;
      teks += `${foot}${garis}`;

      conn.sendMessage(chatId, { text: teks }, { quoted: msg });
    } catch (err) {
      console.error('listisPrem.js error:', err);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menampilkan data.' }, { quoted: msg });
    }
  }
};