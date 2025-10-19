const { savetube } = require('../../toolkit/scrape/yt.js');

module.exports = {
  name: 'youtube',
  command: ['youtube', 'yt'],
  tags: 'Download Menu',
  desc: 'Download video dari YouTube.',
  prefix: true,
  premium: true,

  run: async (conn, msg, { chatInfo, prefix, commandText, args }) => {
    const { chatId, senderId } = chatInfo;
    
    if (!(await isPrem(module.exports, conn, msg))) return;

    if (!args[0]) {
      return conn.sendMessage(chatId, { 
        text: `🎬 *YouTube Video Downloader*\n\n*Cara Pakai:*\n${prefix}${commandText} <url> <kualitas>\n\n*Kualitas:* 144, 240, 360, 480, 720, 1080\n\n*Contoh:*\n${prefix}${commandText} https://youtu.be/xxxxx 720\n${prefix}${commandText} https://youtube.com/watch?v=xxxxx 480\n\n*Default:* 720p` 
      }, { quoted: msg });
    }

    const url = args[0];
    
    // Validasi URL
    if (!url.includes('youtube.com/watch?v=') && !url.includes('youtu.be/') && !url.includes('youtube.com/shorts/')) {
      return conn.sendMessage(chatId, { 
        text: `❌ *URL tidak valid!*\n\nGunakan URL video YouTube:\n• https://youtube.com/watch?v=...\n• https://youtu.be/...\n• https://youtube.com/shorts/...` 
      }, { quoted: msg });
    }

    // Ambil kualitas, default 720
    let quality = args[1] || '720';
    
    // Validasi kualitas
    const validQualities = ['144', '240', '360', '480', '720', '1080'];
    if (!validQualities.includes(quality)) {
      return conn.sendMessage(chatId, { 
        text: `❌ Kualitas tidak valid!\n\nGunakan: ${validQualities.join(', ')}\n\nContoh: ${prefix}${commandText} ${url} 720` 
      }, { quoted: msg });
    }

    await conn.sendMessage(chatId, { react: { text: '🕒', key: msg.key } });

    try {
      await conn.sendMessage(chatId, { 
        text: `⏳ Mendownload video ${quality}p...\nTunggu sebentar...` 
      }, { quoted: msg });

      const hasil = await savetube.download(url, quality);
      
      if (!hasil || !hasil.status) {
        return conn.sendMessage(chatId, { 
          text: `❌ Gagal mengunduh video:\n${hasil?.error || 'Terjadi kesalahan.'}` 
        }, { quoted: msg });
      }

      let text = `🎬 *YouTube Video Downloader*\n\n`;
      text += `📛 *Judul:* ${hasil.result.title || '-'}\n`;
      text += `⏱️ *Durasi:* ${hasil.result.duration || '-'}\n`;
      text += `📺 *Kualitas:* ${quality}p\n`;
      if (hasil.result.downloaded) {
        text += `📊 *Size:* ${hasil.result.downloaded}\n`;
      }
      text += `\n✅ *Berhasil didownload!*`;

      await conn.sendMessage(chatId, {
        video: { url: hasil.result.download },
        caption: text,
        fileName: `YouTube_${quality}p.mp4`
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      
      let errorMessage = '❌ Gagal mendownload video.\n';
      
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