const axios = require('axios');

module.exports = {
  name: 'ssweb',
  command: ['ssweb', 'ss'],
  tags: 'Download Menu',
  desc: 'Mengambil screenshot dari website menggunakan URL',
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
    if (!url || !/^https?:\/\//i.test(url)) {
      return conn.sendMessage(chatId, {
        text: `*Contoh penggunaan:*\n${prefix + commandText} https://example.com`
      }, { quoted: msg });
    }

    try {
      const apiUrl = `${global.HamzWeb}/tools/ssweb?apikey=${global.HamzKey}&url=${encodeURIComponent(url)}`;

      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('API tidak mengembalikan gambar.');
      }

      await conn.sendMessage(chatId, {
        image: Buffer.from(response.data),
        caption: `✅ Screenshot dari: ${url}`
      }, { quoted: msg });

    } catch (error) {
      console.error('SSWEB Error:', error);
      await conn.sendMessage(chatId, {
        text: `❌ Terjadi kesalahan:\n${error.message || 'Tidak dapat mengambil screenshot.'}`
      }, { quoted: msg });
    }
  }
};