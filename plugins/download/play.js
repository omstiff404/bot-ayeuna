const { play } = require('../../toolkit/scrape/play');

module.exports = {
  name: 'play',
  command: ['play', 'lagu', 'song', 'ply'],
  tags: 'Download Menu',
  desc: 'Mendownload lagu dari YouTube',
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
      return conn.sendMessage(chatId, {
        text: `Format salah!\nGunakan: ${prefix}${commandText} someone you loved`
      }, { quoted: msg });
    }

    const query = args.join(" ");

    try {
      await conn.sendMessage(chatId, { react: { text: "🎵", key: msg.key } });

      const result = await play(query);

      const caption = 
`${head}${Obrack} ${result.title} ${Cbrack}
${side} ${btn} Artis: ${result.author}
${side} ${btn} Durasi: ${result.duration}
${side} ${btn} Link: ${result.url}
${foot}${garis}`;

      await conn.sendMessage(chatId, {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: "Play Music",
            thumbnailUrl: result.image,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: { newsletterJid: idCh }
        }
      }, { quoted: msg });

      await conn.sendMessage(chatId, {
        audio: { url: result.audio.url },
        mimetype: 'audio/mpeg',
        fileName: result.audio.filename
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      await conn.sendMessage(chatId, {
        text: "Terjadi kesalahan saat mengambil lagu."
      }, { quoted: msg });
    }
  }
};