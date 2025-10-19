const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'rvo',
  command: ['rvo', 'readviewonce'],
  tags: 'Tools Menu',
  desc: 'Mengekstrak media sekali lihat.',
  prefix: true,
  premium: true,

  run: async (conn, msg, { chatInfo }) => {
    try {
      const { chatId } = chatInfo;
      if (!(await isPrem(module.exports, conn, msg))) return;

      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) return conn.sendMessage(chatId, { text: 'Balas ke media (View Once atau biasa) yang mau diambil.' }, { quoted: msg });

      const viewOnce = quoted.viewOnceMessageV2Extension?.message ||
                       quoted.viewOnceMessageV2?.message ||
                       quoted.viewOnceMessage?.message ||
                       quoted;

      const mediaTypes = ['image', 'video', 'audio'];
      const mediaType = mediaTypes.find(type => viewOnce?.[`${type}Message`]);
      const mediaMsg = viewOnce?.[`${mediaType}Message`];

      if (!mediaType || !mediaMsg?.mediaKey)
        return conn.sendMessage(chatId, { text: 'Media tidak didukung atau sudah dibuka.' }, { quoted: msg });

      const buffer = await downloadMediaMessage(
        { message: { [`${mediaType}Message`]: mediaMsg } },
        'buffer',
        {},
        { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
      );

      if (!buffer) return conn.sendMessage(chatId, { text: 'Gagal mengunduh media.' }, { quoted: msg });

      const ext = mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3';
      const filename = path.join(__dirname, '../../temp', `${Date.now()}.${ext}`);
      fs.mkdirSync(path.dirname(filename), { recursive: true });
      fs.writeFileSync(filename, buffer);

      await conn.sendMessage(chatId, {
        [mediaType]: { url: filename },
        caption: mediaMsg.caption ? `*Pesan:* ${mediaMsg.caption}` : 'Media berhasil diambil.',
      }, { quoted: msg });

    } catch (err) {
      console.error('Error:', err);
      conn.sendMessage(msg.key.remoteJid, {
        text: `Error: ${err.message || err}`,
        quoted: msg,
      });
    }
  }
};