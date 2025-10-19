module.exports = {
  name: 'mute',
  command: ['mute'],
  tags: 'Group Menu',
  desc: 'Aktifkan atau nonaktifkan mode mute grup',
  prefix: true,

  run: async (conn, msg, { chatInfo, prefix, commandText, args }) => {
    try {
      const { chatId, isGroup } = chatInfo;
      if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan di grup.' }, { quoted: msg });

      const { botAdmin, userAdmin } = await stGrup(conn, chatId, msg.key.participant || msg.key.remoteJid);
      if (!userAdmin) return conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg });
      if (!botAdmin) return conn.sendMessage(chatId, { text: 'Bot bukan admin!' }, { quoted: msg });

      const db = getDB();
      const groupName = (await conn.groupMetadata(chatId))?.subject || `Group_${chatId}`;
      let groupData = Object.values(db.Grup).find(g => g.Id === chatId);

      if (!groupData) {
        db.Grup[groupName] = { Id: chatId, mute: false, Welcome: { welcome: false, welcomeText: '' }, autoai: false, chat: 0 };
        saveDB(db);
        groupData = db.Grup[groupName];
      }

      const action = args[0]?.toLowerCase();

      if (action === 'on') {
        if (groupData.mute) return conn.sendMessage(chatId, { text: 'Mode mute sudah aktif di grup ini.' }, { quoted: msg });
        groupData.mute = true;
        saveDB(db);
        return conn.sendMessage(chatId, { text: 'Mode mute diaktifkan. Hanya admin yang dapat menggunakan bot.' }, { quoted: msg });
      }

      if (action === 'off') {
        if (!groupData.mute) return conn.sendMessage(chatId, { text: 'Mode mute tidak aktif di grup ini.' }, { quoted: msg });
        groupData.mute = false;
        saveDB(db);
        return conn.sendMessage(chatId, { text: 'Mode mute dinonaktifkan. Semua member dapat menggunakan bot.' }, { quoted: msg });
      }

      conn.sendMessage(chatId, {
        text: `${prefix}${commandText} on - Aktifkan mode mute\n${prefix}${commandText} off - Nonaktifkan mode mute`,
      }, { quoted: msg });
    } catch {
      conn.sendMessage(msg.key.remoteJid, { text: 'Terjadi kesalahan saat menjalankan perintah.' }, { quoted: msg });
    }
  },
};