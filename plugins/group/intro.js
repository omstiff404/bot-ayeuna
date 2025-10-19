module.exports = {
  name: 'intro',
  command: ['intro'],
  tags: 'Group Menu',
  desc: 'Mengirimkan intro grup',
  prefix: true,

  run: async (conn, msg, {
    chatInfo
  }) => {
    try {
      const { chatId, isGroup } = chatInfo;
      if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya Layla dapat digunakan di grup.' }, { quoted: msg });
      if (!enGcW(chatId)) return conn.sendMessage(chatId, { text: 'Grup ini tidak terdaftar atau fitur welcome tidak aktif.' }, { quoted: msg });

      const welcomeText = getWlcTxt(chatId);
      if (!welcomeText || welcomeText.trim() === '' || welcomeText.includes('Selamat datang @user')) {
        return conn.sendMessage(chatId, { text: 'Pesan welcome belum diatur.' }, { quoted: msg });
      }

      let thumbnailUrl;
      try {
        thumbnailUrl = await conn.profilePictureUrl(chatId, 'image');
      } catch {
        thumbnailUrl = 'https://files.catbox.moe/6ylerz.jpg';
      }

      await conn.sendMessage(chatId, {
        text: welcomeText,
        contextInfo: {
          externalAdReply: {
            title: botFullName,
            body: 'Selamat Datang Member Baru',
            thumbnailUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: idCh
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('Error di plugin intro.js:', error);
      conn.sendMessage(msg.key.remoteJid, { text: 'Terjadi kesalahan saat mengirim pesan intro.' }, { quoted: msg });
    }
  },
};