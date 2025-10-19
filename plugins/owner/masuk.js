const { isJidGroup } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'masuk',
  command: ['masuk', 'gabung'],
  tags: 'Owner Menu',
  desc: 'Bot join grup',
  prefix: true,
  isPremium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isPrem(module.exports, conn, msg))) return;

    let text = args.join(' ');
    if (!text && msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
      const q = msg.message.extendedTextMessage.contextInfo.quotedMessage;
      text = q.conversation || q.extendedTextMessage?.text || '';
    }

    if (!text) {
      return conn.sendMessage(chatId, {
        text: 'Masukkan atau reply link grup.'
      }, { quoted: msg });
    }

    const match = text.match(/chat\.whatsapp\.com\/([\w\d]+)/);
    if (!match) {
      return conn.sendMessage(chatId, {
        text: 'Link tidak valid.'
      }, { quoted: msg });
    }

    try {
      const res = await conn.groupAcceptInvite(match[1]);
      return conn.sendMessage(chatId, {
        text: isJidGroup(res)
          ? `Berhasil join grup.\nID: ${res}`
          : 'Berhasil, menunggu persetujuan admin.'
      }, { quoted: msg });
    } catch (err) {
      console.error(err);
      const failMsg = err.message.includes('rejected') || err.message.includes('kicked')
        ? 'Gagal join. Bot pernah dikeluarkan.'
        : 'Gagal join. Periksa pengaturan grup.';
      return conn.sendMessage(chatId, { text: failMsg }, { quoted: msg });
    }
  }
};