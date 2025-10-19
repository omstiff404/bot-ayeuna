const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { writeExifImg, writeExifVid } = require('../../toolkit/exif.js');

module.exports = {
  name: 'stiker',
  command: ['s', 'stiker', 'sticker'],
  tags: 'Maker Menu',
  desc: 'Membuat sticker',
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
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const isImage = quotedMessage?.imageMessage || msg.message?.imageMessage;
      const isVideo = quotedMessage?.videoMessage || msg.message?.videoMessage;

      if (!isImage && !isVideo) {
        return conn.sendMessage(
          msg.key.remoteJid,
          {
            text: `Balas gambar/video dengan caption *${prefix}s*, *${prefix}stiker*, atau *${prefix}sticker* ` +
                  `atau kirim langsung media dengan caption yang sama!`,
          },
          { quoted: msg }
        );
      }

      let media;
      try {
        media = await downloadMediaMessage({ message: quotedMessage || msg.message }, 'buffer', {});
        if (!media) throw new Error('Media tidak terunduh!');
      } catch (error) {
        return conn.sendMessage(
          msg.key.remoteJid,
          { text: `❌ Gagal mengunduh media! ${error.message}` },
          { quoted: msg }
        );
      }

      const metadata = {
        packname: footer,
        author: 'Stiff Totemo'
      };

      let stickerPath;
      try {
        stickerPath = isImage
          ? await writeExifImg(media, metadata)
          : await writeExifVid(media, metadata);

        if (!stickerPath) throw new Error('Gagal membuat stiker!');
      } catch (error) {
        return conn.sendMessage(
          msg.key.remoteJid,
          { text: `❌ Gagal membuat stiker! ${error.message}` },
          { quoted: msg }
        );
      }

      const stickerBuffer = require('fs').readFileSync(stickerPath);
      await conn.sendMessage(msg.key.remoteJid, { sticker: stickerBuffer }, { quoted: msg });
    } catch (error) {
      conn.sendMessage(
        msg.key.remoteJid,
        { text: `❌ Terjadi kesalahan saat membuat stiker, coba lagi! ${error.message}` },
        { quoted: msg }
      );
      console.error('❌ Error pada plugin stiker:', error);
    }
  },
};