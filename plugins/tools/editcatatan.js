const fs = require('fs');
const path = require('path');
const catatanPath = path.join(__dirname, '../../toolkit/db/catatan.json');

module.exports = {
  name: 'editcatat',
  command: ['catat'],
  tags: 'Tools Menu',
  desc: 'Menambahkan isi ke dalam nama catatan',
  prefix: true,
  owner: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isOwner(module.exports, conn, msg))) return;
      if (!fs.existsSync(catatanPath)) fs.writeFileSync(catatanPath, '{}');
      const catatan = JSON.parse(fs.readFileSync(catatanPath));

      if (!args[0]) return conn.sendMessage(chatId, { text: `Contoh: ${prefix}catat NamaCatatan TeksCatatan` }, { quoted: msg });
      const nama = args.shift();
      if (!catatan[nama]) return conn.sendMessage(chatId, { text: `Catatan *${nama}* tidak ditemukan.` }, { quoted: msg });

      let isiCatatan;
      if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        isiCatatan = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation
          || msg.message.extendedTextMessage.contextInfo.quotedMessage.extendedTextMessage?.text
          || 'Tidak ada teks di reply.';
      } else {
        isiCatatan = args.join(' ');
      }

      if (!isiCatatan) return conn.sendMessage(chatId, { text: 'Teks catatan tidak boleh kosong.' }, { quoted: msg });

      const key = `catatan${Object.keys(catatan[nama]).length + 1}`;
      catatan[nama][key] = isiCatatan;
      fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2));
      conn.sendMessage(chatId, { text: `Berhasil menambahkan isi ke *${nama}*.` }, { quoted: msg });
      } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(msg.key.remoteJid, {
        text: `Error: ${error}`,
        quoted: msg,
      });
    }
  }
};