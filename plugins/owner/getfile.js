const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'getfile',
  command: ['getfile', 'gf'],
  tags: 'Owner Menu',
  desc: 'Menampilkan isi file dalam bentuk teks',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    if (!args.length) {
      return conn.sendMessage(chatId, { text: '⚠️ Masukkan path file yang ingin diambil!' }, { quoted: msg });
    }

    const baseDir = path.join(__dirname, '../../');
    const filePath = path.resolve(baseDir, args.join(' '));

    if (!filePath.startsWith(baseDir)) {
      return conn.sendMessage(chatId, { text: '⚠️ Akses file di luar direktori BaseBot tidak diizinkan!' }, { quoted: msg });
    }

    if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
      return conn.sendMessage(chatId, { text: '❌ File tidak ditemukan atau path adalah direktori!' }, { quoted: msg });
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const filePathDisplay = filePath.replace(baseDir + '/', '');

      await conn.sendMessage(chatId, { text: `📄 *Path File:* ${filePathDisplay}` }, { quoted: msg });

      const maxLength = 4000;
      for (let i = 0; i < fileContent.length; i += maxLength) {
        const chunk = fileContent.slice(i, i + maxLength);
        await conn.sendMessage(chatId, { text: chunk }, { quoted: msg });
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat membaca file:', error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat membaca file!' }, { quoted: msg });
    }
  }
};