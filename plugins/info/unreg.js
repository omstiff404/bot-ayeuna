module.exports = {
  name: 'unreg',
  command: ['unreg', 'hapusakun'],
  tags: 'Info Menu',
  desc: 'Menghapus akun dari database bot.',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId } = chatInfo;
      const db = getDB();

      if (!args[0] || args[0].toLowerCase() !== 'me') {
        return conn.sendMessage(chatId, {
          text: `📌 Cara unreg:\n\n*${prefix}${commandText} me*\n\nPerintah ini akan menghapus akun Anda dari database.`,
        }, { quoted: msg });
      }

      if (!db.Private || typeof db.Private !== 'object') {
        return conn.sendMessage(chatId, { text: '⚠️ Database pengguna kosong!' }, { quoted: msg });
      }

      let foundUser = null;

      for (const [nama, data] of Object.entries(db.Private)) {
        if (data.Nomor === senderId) {
          foundUser = nama;
          break;
        }
      }

      if (!foundUser) {
        return conn.sendMessage(chatId, {
          text: `❌ Akun Anda tidak ditemukan di database!`,
        }, { quoted: msg });
      }

      delete db.Private[foundUser];
      saveDB();

      conn.sendMessage(chatId, {
        text: `✅ Akun Anda berhasil dihapus dari database.\nTerima kasih telah menggunakan bot ini!`,
      }, { quoted: msg });

    } catch (error) {
      console.error('Error saat proses unreg:', error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat menghapus akun!' }, { quoted: msg });
    }
  },
};