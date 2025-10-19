const fs = require('fs');
const path = require('path');
const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'cleartemp',
  command: ['cleartemp', 'ctemp'],
  tags: 'Owner Menu',
  desc: 'Membersihkan folder temp',
  prefix: true,
  owner: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    const tempDir = path.join(__dirname, '../../temp');

    if (!fs.existsSync(tempDir)) {
      return conn.sendMessage(chatId, { text: '📂 Folder temp tidak ditemukan.' }, { quoted: msg });
    }

    try {
      const files = fs.readdirSync(tempDir);
      if (files.length === 0) {
        return conn.sendMessage(chatId, { text: '✅ Folder temp sudah bersih.' }, { quoted: msg });
      }

      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        fs.rmSync(filePath, { recursive: true, force: true });
      });

      return conn.sendMessage(chatId, { text: '✅ Semua file dalam folder temp berhasil dihapus.' }, { quoted: msg });
    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, { text: '❌ Gagal membersihkan folder temp.' }, { quoted: msg });
    }
  }
};