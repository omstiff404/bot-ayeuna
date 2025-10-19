const fs = require('fs');
const path = require('path');
const gameDBPath = path.join(__dirname, '../../toolkit/db/slot.json');
const delay = ms => new Promise(res => setTimeout(res, ms));
const gameSymbols = ['🕊️', '🦀', '🦎', '🍀', '💎', '🍒'];
const getRandom = () => gameSymbols[Math.floor(Math.random() * gameSymbols.length)];

const saveGameLog = data => {
  const gameDB = fs.existsSync(gameDBPath) ? JSON.parse(fs.readFileSync(gameDBPath)) : {};
  gameDB[data.name.toLowerCase()] = data;
  fs.writeFileSync(gameDBPath, JSON.stringify(gameDB, null, 2));
};

module.exports = {
  name: 'Game Slot',
  command: ['isi', 'slot'],
  tags: 'Game Menu',
  desc: 'Main slot gacha uang',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    args,
    commandText
  }) => {
    const { chatId, senderId, pushName } = chatInfo;
    const db = getDB();
    const user = Object.values(db.Private).find(u => u.Nomor === senderId);
    if (!user) return conn.sendMessage(chatId, { text: 'Kamu belum daftar!, gunakan *.daftar* untuk mendaftar' }, { quoted: msg });

    if (!args[0]) return conn.sendMessage(chatId, {
      text: `🎰 Masukkan jumlah taruhan.\n\nContoh:\n.${commandText} 10000`
    }, { quoted: msg });

    const bet = parseInt(args[0]);
    if (isNaN(bet) || bet <= 0)
      return conn.sendMessage(chatId, { text: 'Masukkan jumlah yang valid!' }, { quoted: msg });

    const saldo = user.money?.amount || 0;
    if (bet > saldo)
      return conn.sendMessage(chatId, { text: 'Saldo kamu tidak cukup!' }, { quoted: msg });

    const row1 = [getRandom(), getRandom(), getRandom()];
    const row3 = [getRandom(), getRandom(), getRandom()];
    const menang = Math.random() < 0.5;
    const row2 = menang ? Array(3).fill(getRandom()) : (() => {
      let r; do { r = [getRandom(), getRandom(), getRandom()] }
      while (r[0] === r[1] && r[1] === r[2]); return r;
    })();

    const hasil = row2.join(' : ');
    const hasilUang = menang ? bet * 2 : -bet;
    user.money.amount += hasilUang;
    saveDB();

    saveGameLog({
      name: pushName,
      user: senderId,
      bet,
      gain: hasilUang,
      result: hasil,
      win: menang,
      time: new Date().toISOString()
    });

    const teks = `
╭───🎰 GACHA UANG 🎰───╮
│               ${row1.join(' : ')}
│               ${hasil}
│               ${row3.join(' : ')}
╰────────────────────╯
               ${menang ? `🎉 Kamu Menang! +${hasilUang.toLocaleString()}` : `💥 Zonk! -${Math.abs(hasilUang).toLocaleString()}`}
`.trim();

    const pesanAwal = await conn.sendMessage(chatId, { text: '🎲 Gacha dimulai...' }, { quoted: msg });
    await delay(2000);
    return conn.sendMessage(chatId, { text: teks, edit: pesanAwal.key });
  }
};