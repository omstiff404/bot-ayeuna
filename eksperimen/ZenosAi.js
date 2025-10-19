const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'zenos',
  command: ['zenos'],
  tags: 'Maker Menu',
  desc: 'Mengubah gambar menjadi sesuai keinginan',
  prefix: true,
  run: async (conn, msg, { args, chatInfo }) => {
    const { chatId } = chatInfo;
    
    // Gunakan cara yang lebih reliable
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const img = quoted?.imageMessage || msg.message?.imageMessage;

    if (!img)
      return conn.sendMessage(chatId, { text: '⚠️ Balas atau kirim gambar dengan caption *.zenos*' }, { quoted: msg });

    const text = args.join(' ').trim();

    if (!text)
      return conn.sendMessage(chatId, { 
        text: '⚠️ Masukkan prompt text setelah command\nContoh: *.zenos anime figure style*' 
      }, { quoted: msg });

    try {
      // Tambahkan reaksi "jam"
      await conn.sendMessage(chatId, { react: { text: '🕒', key: msg.key } });

      const buffer = await downloadMediaMessage(
        { message: quoted || msg.message },
        'buffer',
        {},
        { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
      );

      if (!buffer) throw new Error('Media tidak terunduh!');

      const mime = img?.mimetype || 'image/jpeg';
      const ext = mime.includes('image') ? 'jpg' : 'bin';
      const temp = path.join(__dirname, `temp_${Date.now()}.${ext}`);
      fs.writeFileSync(temp, buffer);

      // Upload gambar ke Catbox
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', fs.createReadStream(temp));

      const catboxUploadUrl = 'https://catbox.moe/user/api.php';
      form.append('userhash', '');

      const uploadResponse = await axios.post(catboxUploadUrl, form, {
        headers: form.getHeaders(),
      });

      fs.unlinkSync(temp);

      const imageUrl = uploadResponse.data;

      if (typeof imageUrl !== 'string') {
        throw new Error('Gagal mendapatkan URL gambar dari Catbox');
      }

      // Gunakan API baru dengan prompt dari user
      const figureApiUrl = `https://api.fikmydomainsz.xyz/ai/nanobnna?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(text)}`;

      const figureResponse = await axios.get(figureApiUrl);

      if (!figureResponse.data || !figureResponse.data.status || !figureResponse.data.result) {
        throw new Error('Gagal mendapatkan data figure dari API');
      }

      const figureUrl = figureResponse.data.result;

      // Hapus reaksi "jam" dan kirim hasilnya
      await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
      conn.sendMessage(chatId, { image: { url: figureUrl }, caption: `✅ Zenos AI Result:\nPrompt: ${text}` }, { quoted: msg });

    } catch (err) {
      console.error('[ERROR] zenos:', err);
      await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
      return conn.sendMessage(chatId, { text: `❌ Terjadi kesalahan: ${err.message}` }, { quoted: msg });
    }
  }
};