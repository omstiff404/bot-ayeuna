const { tiktokDl } = require('../../toolkit/scrape/tt.js');

module.exports = {
  name: 'tiktok',
  command: ['tiktok', 'tt'],
  tags: 'Download Menu',
  desc: 'Download video dari TikTok tanpa watermark.',
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
      return conn.sendMessage(chatId, { text: `Example:\n${prefix}${commandText} Url Tiktoknya` }, { quoted: msg });
    }

    if (!args[0].includes('tiktok.com')) {
      return conn.sendMessage(chatId, { text: `Link yang kamu kirim tidak valid.` }, { quoted: msg });
    }

    await conn.sendMessage(chatId, { react: { text: '🕒', key: msg.key } });

    try {
      const hasil = await tiktokDl(args[0]);
      if (hasil && hasil.size_nowm);

      let text = `TikTok Downloader\n`;
      text += `\n\n`;
      text += `❏ *Title* : ${hasil.title}\n`;
      text += `❏ *User* : ${hasil.author.nickname} (@${hasil.author.fullname})\n`;
      text += `❏ *Durasi* : ${hasil.duration}\n`;
      text += `❏ *Download* : Tanpa Watermark\n`;

      await conn.sendMessage(chatId, {
        video: { url: hasil.data[1].url },
        caption: text
      }, { quoted: msg, ephemeralExpiration: msg.expiration });

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: 'Maaf, terjadi kesalahan saat memproses video.' }, { quoted: msg });
    }
  }
}
