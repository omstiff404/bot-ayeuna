const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { writeExifImg } = require('../../toolkit/exif.js');

module.exports = {
  name: 'Sticker Watermark',
  command: ['swm', 'swn'],
  tags: 'Maker Menu',
  desc: 'Mengubah watermark stiker',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      const inputText = args.join(' ').trim();
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const stickerMessage = quotedMessage?.stickerMessage;

      if (!stickerMessage || !inputText) {
        return conn.sendMessage(
          msg.key.remoteJid,
          {
            text:
              'Gunakan:\n' +
              '- *swm <author> | <pack>* → Mengubah author & pack\n' +
              '- *swn <author>* → Hanya mengubah author\n' +
              'Harus reply ke stiker!',
          },
          { quoted: msg }
        );
      }

      let media;
      try {
        media = await downloadMediaMessage({ message: quotedMessage }, 'buffer', {});
        if (!media) throw new Error('Media tidak terunduh!');
      } catch (error) {
        return conn.sendMessage(
          msg.key.remoteJid,
          { text: `❌ Gagal mengunduh stiker! ${error.message}` },
          { quoted: msg }
        );
      }

      let author = 'Unknown';
      let pack = footer;

      if (inputText.includes('|')) {
        const [a, p] = inputText.split('|').map(t => t.trim());
        author = a || author;
        pack = p || pack;
      } else {
        author = inputText;
      }

      let stickerPath;
      try {
        stickerPath = await writeExifImg(media, { author, packname: pack }, true);
        if (!stickerPath) throw new Error('Exif tidak berhasil ditulis!');
        const stickerBuffer = require('fs').readFileSync(stickerPath);

        await conn.sendMessage(msg.key.remoteJid, { sticker: stickerBuffer }, { quoted: msg });
      } catch (error) {
        return conn.sendMessage(
          msg.key.remoteJid,
          { text: `❌ Gagal membuat stiker! ${error.message}` },
          { quoted: msg }
        );
      }
    } catch (error) {
      conn.sendMessage(
        msg.key.remoteJid,
        { text: `❌ Terjadi kesalahan! ${error.message}` },
        { quoted: msg }
      );
      console.error('❌ Error pada plugin swm/swn:', error);
    }
  },
};