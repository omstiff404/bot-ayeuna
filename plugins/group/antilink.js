module.exports = {
  name: 'antilink',
  command: ['antilink'],
  tags: 'Group Menu',
  desc: 'Fitur anti link grup',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;

    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '❌ Perintah ini hanya Layla bisa digunakan dalam grup!' }, { quoted: msg });
    }

    const db = getDB();
    const groupData = Object.values(db.Grup || {}).find(g => g.Id === chatId);
    if (!groupData) {
      return conn.sendMessage(chatId, { text: "❌ Grup belum terdaftar di database.\nGunakan perintah *.daftargc* untuk mendaftar." }, { quoted: msg });
    }

    const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);

    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: msg });
    }

    if (!botAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Layla bukan admin' }, { quoted: msg });
    }

    const input = args[0]?.toLowerCase();
    if (!input || !['on', 'off'].includes(input)) {
      return conn.sendMessage(chatId, {
        text: `Penggunaan: ${prefix}${commandText} <on/off>`
      }, { quoted: msg });
    }

    groupData.gbFilter = groupData.gbFilter || {};
    groupData.gbFilter.link = groupData.gbFilter.link || {};
    groupData.gbFilter.link.antilink = input === 'on';

    saveDB(db);

    return conn.sendMessage(chatId, {
      text: `✅ Fitur antilink berhasil di-${input === 'on' ? 'aktifkan' : 'nonaktifkan'}.`
    }, { quoted: msg });
  }
};