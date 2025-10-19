const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'remini',
  command: ['hd', 'remini'],
  tags: 'Maker Menu',
  desc: 'Mengubah gambar menjadi hd',
  prefix: true,
  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    
    // Deteksi gambar - cara yang lebih sederhana
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const img = quoted?.imageMessage || msg.message?.imageMessage;

    if (!img)
      return conn.sendMessage(chatId, { text: '⚠️ Balas atau kirim gambar dengan caption *.remini*' }, { quoted: msg });

    try {
      // Tambahkan reaksi "jam"
      await conn.sendMessage(chatId, { react: { text: '🕒', key: msg.key } });

      const buffer = await downloadMediaMessage(
        { message: quoted || msg.message },
        'buffer',
        {},
        { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
      );

      if (!buffer) throw new Error('Gagal mengunduh gambar!');

      const mime = img?.mimetype || 'image/jpeg';
      const ext = mime.split('/')[1] || 'jpg';
      const temp = path.join(__dirname, `temp_${Date.now()}.${ext}`);
      
      fs.writeFileSync(temp, buffer);

      // Upload ke Catbox
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', fs.createReadStream(temp));

      const catboxUploadUrl = 'https://catbox.moe/user/api.php';
      
      const uploadResponse = await axios.post(catboxUploadUrl, form, {
        headers: form.getHeaders(),
        timeout: 15000
      });

      fs.unlinkSync(temp);

      const imageUrl = uploadResponse.data;

      if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        throw new Error('Gagal mendapatkan URL gambar dari Catbox');
      }

      console.log('Image uploaded to:', imageUrl);

      // Proses dengan API remini
      const reminiApiUrl = `https://api.fikmydomainsz.xyz/imagecreator/remini?url=${encodeURIComponent(imageUrl)}`;

      const reminiResponse = await axios.get(reminiApiUrl, {
        timeout: 30000
      });

      // Validasi response sesuai format API Anda
      if (!reminiResponse.data || reminiResponse.data.status !== true || !reminiResponse.data.result) {
        throw new Error('API remini gagal memproses gambar');
      }

      const reminiUrl = reminiResponse.data.result;

      // Hapus reaksi "jam" dan kirim hasil
      await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
      
      // Kirim gambar hasil
      await conn.sendMessage(chatId, { 
        image: { url: reminiUrl }, 
        caption: '✅ Gambar HD berhasil diproses!' 
      }, { quoted: msg });

    } catch (err) {
      console.error('[ERROR] remini:', err);
      
      // Hapus reaksi "jam"
      await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
      
      let errorMessage = '❌ Terjadi kesalahan: ';
      if (err.message.includes('timeout')) {
        errorMessage += 'Proses terlalu lama, coba lagi nanti';
      } else if (err.message.includes('network') || err.code === 'ENOTFOUND') {
        errorMessage += 'Gagal terhubung ke server';
      } else {
        errorMessage += err.message || 'Gagal memproses gambar';
      }
      
      return conn.sendMessage(chatId, { text: errorMessage }, { quoted: msg });
    }
  }
};