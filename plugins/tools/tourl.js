const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'tourl',
  command: ['tourl'],
  tags: 'Tools Menu',
  desc: 'Mengubah media menjadi URL.',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const img = quoted?.imageMessage || msg.message?.imageMessage;
    const vid = quoted?.videoMessage || msg.message?.videoMessage;

    if (!img && !vid)
      return conn.sendMessage(chatId, { text: '⚠️ Balas atau kirim gambar/video dengan caption *.tourl*' }, { quoted: msg });

    try {
      const buffer = await downloadMediaMessage(
        { message: quoted || msg.message },
        'buffer',
        {},
        { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
      );

      if (!buffer) throw new Error('Media tidak terunduh!');

      const mime = img?.mimetype || vid?.mimetype || 'application/octet-stream';
      const ext = mime.includes('image') ? 'jpg' : mime.includes('video') ? 'mp4' : 'bin';
      const temp = path.join(__dirname, `temp_${Date.now()}.${ext}`);

      fs.writeFileSync(temp, buffer);

      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', fs.createReadStream(temp));

      const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
      fs.unlinkSync(temp);

      if (typeof res.data === 'string' && res.data.startsWith('https://')) {
        return conn.sendMessage(chatId, { text: `✅ URL:\n${res.data}` }, { quoted: msg });
      }

      throw new Error('Respons dari server tidak valid');
    } catch (err) {
      console.error('[ERROR] tourl:', err);
      return conn.sendMessage(chatId, { text: `❌ Terjadi kesalahan: ${err.message}` }, { quoted: msg });
    }
  }
};