const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'Personal Talk Vidio',
  command: ['ptv', 'pvt'],
  tags: 'Tools Menu',
  desc: 'Generate Ptv studio',
  prefix: true,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const vid = quoted?.videoMessage || msg.message?.videoMessage;

    if (!vid) {
      return conn.sendMessage(chatId, {
        text: 'Balas atau kirim video dengan caption *.ptv* atau *.pvt*'
      }, { quoted: msg });
    }

    try {
      const buffer = await downloadMediaMessage(
        { message: quoted || msg.message },
        'buffer',
        {},
        { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
      );

      if (!buffer) throw new Error('Gagal mengunduh video');

      await conn.sendMessage(chatId, {
        video: buffer,
        mimetype: 'video/mp4',
        ptv: true
      });

    } catch (err) {
      console.error('pvt.js:', err);
      await conn.sendMessage(chatId, {
        text: `Terjadi kesalahan:\n${err.message}`
      }, { quoted: msg });
    }
  }
};