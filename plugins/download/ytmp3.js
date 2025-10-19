const { savetube } = require('../../toolkit/scrape/yt.js');

module.exports = {
  name: 'ytmp3',
  command: ['ytmp3', 'ytaudio'],
  tags: 'Download Menu',
  desc: 'Download audio MP3 dari YouTube.',
  prefix: true,
  premium: true,

  run: async (conn, msg, { chatInfo, prefix, commandText, args }) => {
    const { chatId, senderId } = chatInfo;
    
    if (!(await isPrem(module.exports, conn, msg))) return;

    if (!args[0]) {
      return conn.sendMessage(chatId, { 
        text: `🎵 *YouTube MP3 Downloader*\n\n*Cara Pakai:*\n${prefix}${commandText} <url_youtube>\n\n*Contoh:*\n${prefix}${commandText} https://youtu.be/xxxxx\n${prefix}${commandText} https://youtube.com/watch?v=xxxxx\n\n*Format:* MP3 128kbps` 
      }, { quoted: msg });
    }

    const url = args[0];
    
    // Validasi URL
    if (!url.includes('youtube.com/watch?v=') && !url.includes('youtu.be/') && !url.includes('youtube.com/shorts/')) {
      return conn.sendMessage(chatId, { 
        text: `❌ *URL tidak valid!*\n\nGunakan URL video YouTube:\n• https://youtube.com/watch?v=...\n• https://youtu.be/...\n• https://youtube.com/shorts/...` 
      }, { quoted: msg });
    }

    await conn.sendMessage(chatId, { react: { text: '🕒', key: msg.key } });

    try {
      await conn.sendMessage(chatId, { 
        text: `⏳ Mendownload audio MP3...\nTunggu sebentar...` 
      }, { quoted: msg });

      const hasil = await savetube.download(url, 'mp3');
      
      if (!hasil || !hasil.status) {
        return conn.sendMessage(chatId, { 
          text: `❌ Gagal mengunduh audio:\n${hasil?.error || 'Terjadi kesalahan.'}` 
        }, { quoted: msg });
      }

      let text = `🎵 *YouTube MP3 Downloader*\n\n`;
      text += `📛 *Judul:* ${hasil.result.title || '-'}\n`;
      text += `⏱️ *Durasi:* ${hasil.result.duration || '-'}\n`;
      text += `🎧 *Kualitas:* 128kbps MP3\n`;
      if (hasil.result.downloaded) {
        text += `📊 *Size:* ${hasil.result.downloaded}\n`;
      }
      text += `\n✅ *Berhasil didownload!*`;

      await conn.sendMessage(chatId, {
        audio: { url: hasil.result.download },
        mimetype: 'audio/mpeg',
        fileName: `${hasil.result.title?.substring(0, 50) || 'YouTube_Audio'}.mp3`,
        caption: text
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      
      let errorMessage = '❌ Gagal mendownload audio.\n';
      
      if (err.message.includes('invalid link')) {
        errorMessage += 'Pastikan URL video YouTube valid!';
      } else if (err.message.includes('premium')) {
        errorMessage += 'Fitur ini hanya untuk user premium!';
      } else {
        errorMessage += 'Coba lagi nanti atau gunakan video yang berbeda.';
      }
      
      conn.sendMessage(chatId, { 
        text: errorMessage 
      }, { quoted: msg });
    }
  }
};