const facebook = require("../../toolkit/scrape/facebook");

module.exports = {
  name: 'facebook',
  command: ['fb', 'fbdl', 'facebook'],
  tags: 'Download Menu',
  desc: 'Download video dari Facebook',
  prefix: true,
  premium: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isPrem(module.exports, conn, msg))) return;

    const url = args[0];
    if (!url) {
      return conn.sendMessage(chatId, {
        text: `Format salah. Gunakan: ${prefix}${commandText} <url>`
      }, { quoted: msg });
    }

    if (!/^https?:\/\/(www\.)?facebook\.(com|watch)\/.+/.test(url)) {
      return conn.sendMessage(chatId, {
        text: `URL Facebook tidak valid.`
      }, { quoted: msg });
    }

    try {
      await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

      const videoData = await facebook(url);
      if (!videoData?.status || !videoData.video?.length) {
        return conn.sendMessage(chatId, {
          text: "Gagal mengambil video. Pastikan link valid dan publik."
        }, { quoted: msg });
      }

      const { url: videoUrl, resolution = "Tidak diketahui", format = "Tidak diketahui" } = videoData.video[0];

      const caption = `Video ditemukan:\nResolusi: ${resolution}\nFormat: ${format}`;

      await conn.sendMessage(chatId, {
        caption,
        video: { url: videoUrl }
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, {
        text: "Terjadi kesalahan. Coba lagi nanti."
      }, { quoted: msg });
    }
  },
};