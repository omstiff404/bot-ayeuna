const { tiktokDl } = require('../../toolkit/scrape/screaper.js');

module.exports = {
  name: 'tiktok',
  command: ['tiktokmp3', 'ttmp3'],
  tags: 'Download Menu',
  desc: 'Download audio dari TikTok.',
  prefix: true,
  premium: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isPrem(module.exports, conn, msg))) return;
    if (!args[0]) {
      return conn.sendMessage(chatId, { text: `Example:\n${prefix}${commandText} https://vt.tiktok.com/7494086723190721798/` }, { quoted: msg });
    }

    if (!args[0].includes('tiktok.com')) {
      return conn.sendMessage(chatId, { text: `Link yang kamu kirim tidak valid.` }, { quoted: msg });
    }

    await conn.sendMessage(chatId, { react: { text: '🕒', key: msg.key } });
				try {
					const hasil = await tiktokDl(args[0]);
					await conn.sendMessage(chatId, {
						audio: { url: hasil.music_info.url },
						mimetype: 'audio/mpeg'
					}, { quoted: msg, ephemeralExpiration: msg.expiration });
				} catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: 'Maaf, terjadi kesalahan saat memproses audio.' }, { quoted: msg });
    }
	}
}