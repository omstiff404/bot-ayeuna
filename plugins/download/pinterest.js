const fetch = require('node-fetch');
const cheerio = require('cheerio');

const { pinterest } = require('../../toolkit/scrape/tt.js'); // Pastikan path ini benar

// Variabel untuk menyimpan hasil pencarian dan indeks saat ini
let searchResults = {};
let currentIndex = {};

module.exports = {
    name: 'pinterest',
    command: ['pinterest', 'pin'],
    tags: 'Download Menu',
    desc: 'Cari dan kirim gambar dari Pinterest (tanpa tombol Next).',
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
        const text = args.join(" "); // Kata kunci pencarian
        const userId = senderId; // ID Pengguna

        await conn.sendMessage(chatId, { react: { text: '🕛', key: msg.key } });

        if (!text) {
            return conn.sendMessage(chatId, { text: `Silakan berikan kata kunci pencarian. Contoh: ${prefix}${commandText} kucing lucu` }, { quoted: msg });
        }

        try {
            // Reset hasil pencarian
            searchResults[userId] = null;
            currentIndex[userId] = 0;

            let anu = await pinterest(text);
            if (!anu || anu.length === 0) {
                return conn.sendMessage(chatId, { text: 'Tidak ada hasil ditemukan untuk kata kunci tersebut!' }, { quoted: msg });
            }

            // Simpan hasil pencarian
            searchResults[userId] = anu;

            // Kirim semua gambar
            for (let i = 0; i < searchResults[userId].length; i++) {
                const result = searchResults[userId][i];

                const imageMessage = {
                    image: { url: result.images_url },
                    caption: `*Media Url :* ${result.pin}${result.link ? '\n*Source :* ' + result.link : ''}\n\nHasil ke ${i + 1} dari ${searchResults[userId].length}`,
                    footer: 'Pinterest Image'
                };

                await conn.sendMessage(chatId, imageMessage, { quoted: msg });
            }

        } catch (e) {
            console.error("Error in pinterest plugin:", e);
            conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mencari gambar. Mohon coba lagi nanti.' }, { quoted: msg });
        } finally {
            // Hapus hasil pencarian setelah selesai
            delete searchResults[userId];
            delete currentIndex[userId];
        }
    }
};
