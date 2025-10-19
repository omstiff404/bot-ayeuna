module.exports = {
  name: 'daftargc',
  command: ['daftargc'],
  tags: 'Info Menu',
  desc: 'Mendaftarkan grup ke database.',
  prefix: true,
  whiteLiss: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, isGroup } = chatInfo;

    try {
      if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan di dalam grup.' }, { quoted: msg });

      intDB();
      const db = getDB();
      db.Grup ??= {};

      const { subject: groupName } = await conn.groupMetadata(chatId);
      if (Object.values(db.Grup).some(g => g.Id === chatId)) {
        return conn.sendMessage(chatId, { text: 'Grup ini sudah terdaftar di database.' }, { quoted: msg });
      }

      db.Grup[groupName] = {
        Id: chatId,
        autoai: false,
        bell: false,
        mute: false,
        setWarn: 0,
        gbFilter: {
          Welcome: { welcome: false, welcomeText: '' },
          Left: { gcLeft: false, leftText: '' },
          link: { antilink: false, setlink: '' },
          stiker: { antistiker: false },
          antibot: false,
          antiTagSw: false
        },
        antibadword: { badword: false, badwordText: '' }
      };

      saveDB();
      conn.sendMessage(chatId, { text: `Grup *${groupName}* berhasil didaftarkan ke dalam database.` }, { quoted: msg });
    } catch (err) {
      console.error('Plugin daftargc.js error:', err);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mendaftarkan grup.' }, { quoted: msg });
    }
  },
};