const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const p = path.join(__dirname, './db/game.json');
const tokoPath = path.join(__dirname, './db/datatoko.json');
const bankPath = path.join(__dirname, './db/bank.json');
const storePath = path.join(__dirname, './set/toko.json');

const readJSON = (file, def = {}) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : def;
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

const load = () => {
  const d = readJSON(p, {});
  return { FunctionGame: d.FunctionGame || {}, tca: d.tca || {} };
};

const save = data => {
  const current = readJSON(p, {});
  current.FunctionGame = data.FunctionGame || {};
  writeJSON(p, current);
};

const bersih = data => Object.fromEntries(Object.entries(data).filter(([_, v]) => v?.status));
const loadToko = () => readJSON(tokoPath, { pendingOrders: [] });
const saveToko = data => writeJSON(tokoPath, data);
const loadBank = () => {
  const bank = readJSON(bankPath);
  if (!bank.bank || typeof bank.bank.saldo !== 'number') bank.bank = { saldo: 0 };
  return bank;
};
const saveBank = data => writeJSON(bankPath, data);
const loadStore = () => readJSON(storePath, { shops: {} });
const saveStore = data => writeJSON(storePath, data);

// Fungsi untuk menghapus data game.json
function clearGameData() {
  try {
    if (fs.existsSync(p)) {
      fs.writeFileSync(p, JSON.stringify({ FunctionGame: {}, tca: {} }, null, 2));
      console.log(chalk.green('Data game.json berhasil dihapus.'));
    } else {
      console.log(chalk.yellow('File game.json tidak ditemukan.'));
    }
  } catch (err) {
    console.error(chalk.redBright('[ERROR] clearGameData:'), err);
  }
}

// Menjalankan fungsi clearGameData setiap 60 detik
setInterval(clearGameData, 30 * 60 * 1000);

async function handleGame(conn, msg, chatId, text) {
  try {
    const replyId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const nomor = (msg.key.participant || msg.key.remoteJid || '').replace(/\D/g, '') + '@s.whatsapp.net';
    const jawaban = text.toLowerCase().trim();

    const dbUser = getDB();
    const userKey = Object.keys(dbUser.Private).find(k => dbUser.Private[k].Nomor === nomor);
    const toko = loadToko();
    const pendingIndex = toko.pendingOrders.findIndex(o => o.chance?.id === nomor);

    if (pendingIndex !== -1) {
      const order = toko.pendingOrders[pendingIndex].chance;
      if (['ya', 'iya'].includes(jawaban)) {
        const gameDb = load();
        const user = dbUser.Private[userKey];

        if (user?.money?.amount >= 30000) {
          user.money.amount -= 30000;
          const bank = loadBank();
          bank.bank.saldo += 30000;
          saveBank(bank);

          const target = gameDb.FunctionGame[order.idKey];
          if (target) {
            target.chance = (target.chance || 0) + order.barang;
            toko.pendingOrders.splice(pendingIndex, 1);
            saveToko(toko);
            save(gameDb);
            global.saveDB(dbUser);
            await conn.sendMessage(chatId, {
              text: `Pembelian berhasil. 3 kesempatan ditambahkan.\nSisa saldo: Rp${user.money.amount.toLocaleString('id-ID')}`
            }, { quoted: msg });
          } else {
            await conn.sendMessage(chatId, { text: 'Data soal tidak ditemukan.' }, { quoted: msg });
          }
        } else {
          await conn.sendMessage(chatId, { text: 'Saldo kurang atau kamu belum terdaftar.' }, { quoted: msg });
        }
        return true;
      }

      if (['tidak', 'no'].includes(jawaban)) {
        toko.pendingOrders.splice(pendingIndex, 1);
        saveToko(toko);
        await conn.sendMessage(chatId, { text: 'Pembelian dibatalkan.' }, { quoted: msg });
        return true;
      }
    }

    if (!replyId) return false;

    const db = load();
    const key = Object.keys(db.FunctionGame).find(k => db.FunctionGame[k].id === replyId);
    if (!key) return false;

    if (!userKey) {
      await conn.sendMessage(chatId, { text: 'Kamu belum daftar. Ketik *.daftar* untuk mulai.' }, { quoted: msg });
      return true;
    }

    const user = dbUser.Private[userKey];
    const item = db.FunctionGame[key];
    const listJawaban = (Array.isArray(item.jawaban || item.data?.jawaban)
      ? item.jawaban || item.data.jawaban
      : [item.jawaban || item.data?.jawaban]
    ).map(j => String(j).toLowerCase());

    if (listJawaban.includes(jawaban)) {
      const bank = loadBank();
      const reward = 100000;
      const tax = parseFloat((bank.bank.tax || '1%').replace('%', '')) || 0;
      const taxAmount = Math.floor(reward * tax / 100);
      const final = reward - taxAmount;

      if (bank.bank.saldo >= reward) {
        user.money.amount = (user.money.amount || 0) + final;
        bank.bank.saldo += taxAmount - reward;
        saveBank(bank);
        global.saveDB(dbUser);
        await conn.sendMessage(chatId, {
          text: `Jawaban benar! Kamu mendapat Rp${final.toLocaleString('id-ID')}.\n(Pajak ${tax}% = Rp${taxAmount.toLocaleString('id-ID')})`
        }, { quoted: msg });
      } else {
        await conn.sendMessage(chatId, { text: 'Jawaban benar, tapi saldo bank tidak cukup untuk memberikan reward.' }, { quoted: msg });
      }

      delete db.FunctionGame[key];
    } else {
      item.chance = (item.chance || 3) - 1;

      if (item.chance <= 0) {
        await conn.sendMessage(chatId, {
          text: `Kesempatan habis. Jawaban benar: ${listJawaban.join(', ')}`
        }, { quoted: msg });
        delete db.FunctionGame[key];
      } else {
        db.FunctionGame[key] = item;

        if (item.chance === 1) {
          toko.pendingOrders.push({ chance: { idKey: key, barang: 3, status: true, id: nomor } });
          saveToko(toko);
          await conn.sendMessage(chatId, {
            text: `Kesempatan tersisa 1. Mau beli 3 kesempatan seharga Rp30.000?\nBalas *ya* untuk beli, *tidak* untuk batal.`
          }, { quoted: msg });
        } else {
          await conn.sendMessage(chatId, {
            text: `Jawaban salah. Sisa kesempatan: ${item.chance}`
          }, { quoted: msg });
        }
      }
    }

    save(db);
    return true;
  } catch (err) {
    console.error(chalk.redBright('[ERROR] handleGame:'), err);
    return false;
  }
}

module.exports = {
  handleGame,
  load,
  save,
  bersih,
  loadToko,
  saveToko,
  loadBank,
  saveBank,
  loadStore,
  saveStore,
  p
};
