const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { hitamkan } = require('../../toolkit/scrape/tt.js');

module.exports = {
  name: 'hitamkan',
  command: ['hitamkan', 'toblack'],
  tags: 'Maker Menu',
  desc: 'Membuat gambar menjadi hitam putih.',
  prefix: true,

  run: async (conn, msg, { chatInfo, commandText, prefix }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;

      // Tambahkan reaksi jam (menunggu)
      await conn.sendMessage(chatId, { react: { text: '🕛', key: msg.key } });

      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const isImage =
        (quotedMessage?.imageMessage ||
          (quotedMessage?.documentMessage?.mimetype || '').startsWith('image/')) ||
        (msg.message?.imageMessage ||
          (msg.message?.documentMessage?.mimetype || '').startsWith('image/'));

      if (isImage) {
        try {
          let media;
          if (quotedMessage?.imageMessage) {
            media = await downloadMediaMessage(
              { message: quotedMessage },
              'buffer',
              {},
              { logger: console, reupload: false }
            );
          } else {
            media = await downloadMediaMessage(
              msg,
              'buffer',
              {},
              { logger: console, reupload: false }
            );
          }

          let a = await hitamkan(media, 'hitam');
          await conn.sendMessage(chatId, { image: a, caption: 'Done' }, { quoted: msg });
        } catch (error) {
          console.error(error);
          await conn.sendMessage(chatId, { text: 'Server sedang offline!' }, { quoted: msg });
        }
      } else {
        await conn.sendMessage(
          chatId,
          { text: `Kirim/Reply Gambar dengan format\nExample: ${prefix + commandText}` },
          { quoted: msg }
        );
      }
    } catch (error) {
      console.error(error);
      await conn.sendMessage(
        chatId,
        { text: 'Maaf, terjadi kesalahan saat memproses gambar.' },
        { quoted: msg }
      );
    }
  },
};
