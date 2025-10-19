const fs = require('fs');
const tokoPath = './toolkit/set/toko.json';

module.exports = {
  name: 'listtoko',
  command: ['listtoko', 'daftartoko'],
  tags: 'Info Menu',
  desc: 'Menampilkan daftar toko yang terdaftar',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    args
  }) => {
    const { chatId } = chatInfo;

    if (!fs.existsSync(tokoPath)) {
      return conn.sendMessage(chatId, { text: "File toko.json tidak ditemukan." }, { quoted: msg });
    }

    const data = JSON.parse(fs.readFileSync(tokoPath));
    const tokoList = Object.keys(data.storeSetting || {});

    if (tokoList.length === 0) {
      return conn.sendMessage(chatId, { text: "Belum ada toko yang terdaftar." }, { quoted: msg });
    }

    if (args[0]) {
      const idx = parseInt(args[0]) - 1;
      if (isNaN(idx) || !tokoList[idx]) {
        return conn.sendMessage(chatId, { text: "Nomor toko tidak valid!" }, { quoted: msg });
      }
      return conn.sendMessage(chatId, { text: `${tokoList[idx]} adalah toko nomor ${args[0]}.` }, { quoted: msg });
    }

    const daftar = tokoList.map((toko, i) => `${side}${btn} ${i + 1}. ${toko}`).join('\n');
    const teks = `${head}${Obrack} list toko ${Cbrack}\n${daftar}\n${foot}${garis}`;

    conn.sendMessage(chatId, { text: teks }, { quoted: msg });
  }
};