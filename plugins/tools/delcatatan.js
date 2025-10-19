const fs = require('fs');
const path = require('path');
const catatanPath = path.join(__dirname, '../../toolkit/db/catatan.json');

module.exports = {
  name: 'delcatat',
  command: ['delcatat'],
  tags: 'Tools Menu',
  desc: 'Hapus nama catatan',
  prefix: true,
  owner: false,

  run: async (conn, msg, { chatInfo, textMessage, prefix, args }) => {
    try {
      const { chatId } = chatInfo;
      if (!(await isOwner(module.exports, conn, msg))) return;

      if (!fs.existsSync(catatanPath)) fs.writeFileSync(catatanPath, '{}');
      const catatan = JSON.parse(fs.readFileSync(catatanPath));
      const nama = args[0];

      if (!nama) return conn.sendMessage(chatId, { text: `Contoh: ${prefix}delcatat NamaCatatan` }, { quoted: msg });
      if (!catatan[nama]) return conn.sendMessage(chatId, { text: `Catatan *${nama}* tidak ditemukan.` }, { quoted: msg });

      delete catatan[nama];
      fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2));
      conn.sendMessage(chatId, { text: `Berhasil menghapus catatan *${nama}*.` }, { quoted: msg });

    } catch (err) {
      console.error('Error:', err);
      conn.sendMessage(chatId, { text: `Error: ${err}`, quoted: msg });
    }
  }
};