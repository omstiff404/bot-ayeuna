const generateLink = require('../../toolkit/scrape/costumelink.js');

module.exports = {
  name: 'linkcostum',
  command: ['linkcostum'],
  tags: 'Tools Menu',
  desc: 'Membuat shortlink wa.me dengan kode dan sandi custom',
  prefix: true,
  owner: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    try {
      const res = await generateLink();
      if (!res?.url) {
        return conn.sendMessage(chatId, { text: '❌ Gagal membuat link.' }, { quoted: msg });
      }

      const link = res.url;
      const info = `❀ *Shortlink Berhasil Dibuat!*\n\n⤷ Link: ${link}\n•⤷ Kode: nommmmr\n⤷ Sandi: owner\n⤷ Berlaku: 5 menit`;

      await conn.sendMessage(chatId, { text: info }, { quoted: msg });
    } catch (e) {
      console.error("LinkCostum Error:", e);
      conn.sendMessage(chatId, { text: '❌ Terjadi kesalahan saat membuat link.' }, { quoted: msg });
    }
  }
};