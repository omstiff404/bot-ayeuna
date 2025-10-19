module.exports = {
  name: 'open',
  command: ['open', 'buka', 'bukagrup'],
  tags: 'Group Menu',
  desc: 'Menjadwalkan pembukaan chat grup',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup)
      return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg });

    try {
      const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);
      if (!userAdmin) return conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg });
      if (!botAdmin) return conn.sendMessage(chatId, { text: 'Bot bukan admin!' }, { quoted: msg });

      intDB();
      const db = getDB();
      const groupKey = Object.keys(db.Grup).find(k => db.Grup[k].Id === chatId);
      if (!groupKey) return conn.sendMessage(chatId, { text: 'Grup belum terdaftar di database.' }, { quoted: msg });

      const groupData = db.Grup[groupKey];
      groupData.gbFilter ??= {};
      groupData.gbFilter.openTime ??= {};

      if (args[0]) {
        const duration = Format.parseDuration(args[0]);
        if (!duration)
          return conn.sendMessage(chatId, {
            text: 'Format waktu tidak valid. Gunakan contoh: 1h, 30m, 1d, dsb.'
          }, { quoted: msg });

        groupData.gbFilter.openTime = { active: true, until: Date.now() + duration };
        saveDB(db);

        return conn.sendMessage(chatId, {
          text: `✅ Grup akan *dibuka otomatis* dalam ${args[0]}.`
        }, { quoted: msg });
      }

      groupData.gbFilter.openTime = { active: false };
      saveDB(db);
      await conn.groupSettingUpdate(chatId, 'not_announcement');

    } catch (err) {
      console.error('Open Group Error:', err);
      return conn.sendMessage(chatId, { text: '❌ Gagal memproses permintaan.' }, { quoted: msg });
    }
  }
};