const axios = require('axios');

module.exports = {
  name: 'Tebak Gambar',
  command: ['tebakgambar', 'tebak'],
  tags: 'Game Menu',
  desc: 'Game tebak gambar',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, senderId } = chatInfo;

    try {
      const data = global.load(global.pPath);
      const gameData = global.bersih(data.FunctionGame || {});
      data.FunctionGame = gameData;
      global.save(data, global.pPath);

      const isPlaying = Object.values(gameData).some(v =>
        v.status && v.chatId === chatId && v.Nomor === senderId
      );

      if (isPlaying) {
        return conn.sendMessage(chatId, {
          text: `Kamu masih punya soal tebak gambar yang belum dijawab. Silakan jawab dulu.`,
        }, { quoted: msg });
      }

      const { data: soalList } = await axios.get('https://raw.githubusercontent.com/Zyknn/database/main/tebakgambar.json');
      const soal = soalList[Math.floor(Math.random() * soalList.length)];

      const sent = await conn.sendMessage(chatId, {
        image: { url: soal.img },
        caption: `Tebak Gambar!\n\n${soal.deskripsi}\n\nBalas dengan jawaban kamu!`
      }, { quoted: msg });

      const sessionKey = `soal${Object.keys(gameData).length + 1}`;
      gameData[sessionKey] = {
        status: true,
        id: sent.key.id,
        Nomor: senderId,
        chatId,
        chance: 3,
        data: {
          soal: soal.deskripsi,
          tipe: 'tebakgambar',
          jawaban: soal.jawaban.toLowerCase()
        }
      };

      data.FunctionGame = gameData;
      global.save(data, global.pPath);

    } catch (e) {
      console.error('[TEBAK-GAMBAR ERROR]', e);
      conn.sendMessage(chatId, {
        text: `Terjadi kesalahan saat memulai game. Coba lagi nanti.`
      }, { quoted: msg });
    }
  }
};