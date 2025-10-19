const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'removebg',
  command: ['removebg'],
  tags: 'Maker Menu',
  desc: 'Menghapus background gambar.',
  prefix: true,
  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const img = quoted?.imageMessage || msg.message?.imageMessage;

    if (!img)
      return conn.sendMessage(chatId, { text: '⚠️ Balas atau kirim gambar dengan caption *.removebg*' }, { quoted: msg });

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

      const mime = img?.mimetype || 'image/jpeg'; // Default ke image/jpeg jika mimetype tidak ada
      const ext = mime.includes('image') ? 'jpg' : 'bin';
      const temp = path.join(__dirname, `temp_${Date.now()}.${ext}`);
      fs.writeFileSync(temp, buffer);

      // Bagian ini mengunggah gambar ke Catbox
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', fs.createReadStream(temp));

      // Ganti URL dengan endpoint yang benar
      const catboxUploadUrl = 'https://catbox.moe/user/api.php'; // Endpoint yang benar untuk upload
      form.append('userhash', ''); // Jika diperlukan, tambahkan userhash

      const uploadResponse = await axios.post(catboxUploadUrl, form, {
        headers: form.getHeaders(),
      });

      fs.unlinkSync(temp);

      const imageUrl = uploadResponse.data; // URL gambar dari Catbox

      if (typeof imageUrl !== 'string') {
        throw new Error('Gagal mendapatkan URL gambar dari Catbox');
      }

      // Bagian ini menggunakan URL gambar untuk remove background
      const removeBgApiUrl = `https://api.fikmydomainsz.xyz/imagecreator/removebg?url=${encodeURIComponent(imageUrl)}`;

      const removeBgResponse = await axios.get(removeBgApiUrl);

      // Pastikan API mengembalikan data yang benar
      if (!removeBgResponse.data || !removeBgResponse.data.status || !removeBgResponse.data.result) {
        throw new Error('Gagal mendapatkan data remove background dari API');
      }

      const removeBgUrl = removeBgResponse.data.result;

      // Hapus reaksi "jam" dan kirim hasilnya ke pengguna
      await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
      conn.sendMessage(chatId, { image: { url: removeBgUrl }, caption: '✅ Background removed:' }, { quoted: msg });

    } catch (err) {
      console.error('[ERROR] removebg:', err);
      // Hapus reaksi "jam" dan kirim pesan kesalahan
      await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
      return conn.sendMessage(chatId, { text: `❌ Terjadi kesalahan: ${err.message}` }, { quoted: msg });
    }
  }
};