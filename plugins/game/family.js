const axios = require('axios');

module.exports = {
  name: 'Family100',
  command: ['family100', 'f100'],
  tags: 'Game Menu',
  desc: 'Game Family 100',
  prefix: true,
  run: async (conn, msg, { chatInfo }) => {
    const { chatId, senderId } = chatInfo;

    try {
      // Load existing game data from the database (file)
      const data = global.load(global.pPath);
      const gameData = global.bersih(data.FunctionGame || {});
      data.FunctionGame = gameData;
      global.save(data, global.pPath);

      // Check if the user already has an ongoing session
      const isPlaying = Object.values(gameData).some(v =>
        v.status && v.chatId === chatId && v.Nomor === senderId && v.tipe === 'family100'
      );
      if (isPlaying) {
        return conn.sendMessage(chatId, {
          text: `Kamu masih punya soal Family 100 yang belum dijawab. Silakan selesaikan dulu.`,
        }, { quoted: msg });
      }

      // Fetch data from the JSON URL
      const { data: anu } = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/family100.json');

      // Get a random question
      const random = anu[Math.floor(Math.random() * anu.length)];

      // Format the question and answers
      const hasil = `*Jawablah Pertanyaan Berikut :*\n\n${random.soal}\n\nTerdapat *${random.jawaban.length}* Jawaban ${random.jawaban.find(v => v.includes(' ')) ? `(beberapa Jawaban Terdapat Spasi)\n` : ''}\n\nNote:\nBerhasil menjawab salah satu soal ,game akan berakhir`.trim();

      console.log(random.jawaban);

      // Send the question
      const sent = await conn.sendMessage(chatId, { text: hasil }, { quoted: msg });

      // Create a session key
      const sessionKey = `family100_${Object.keys(gameData).length + 1}`;

      // Initialize the game session in the database
      gameData[sessionKey] = {
        status: true,
        id: sent.key.id,
        Nomor: senderId,
        chatId: chatId,
        chance: 3, // No chance limit for Family100
        tipe: 'family100',
        data: {
          soal: random.soal,
          jawaban: random.jawaban,
          terjawab: Array.from(random.jawaban, () => false)
        }
      };

      data.FunctionGame = gameData;
      global.save(data, global.pPath);

    } catch (e) {
      console.error('[FAMILY100 ERROR]', e);
      conn.sendMessage(chatId, {
        text: `Terjadi kesalahan saat memulai game. Coba lagi nanti.`
      }, { quoted: msg });
    }
  }
};
