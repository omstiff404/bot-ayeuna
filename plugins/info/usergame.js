const fs = require('fs');
const path = require('path');
const gamePath = path.join(__dirname, '../../toolkit/db/game.json');

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

module.exports = {
  name: 'usergame',
  command: ['game', 'userme'],
  tags: 'Info Menu',
  desc: 'Menampilkan akun game pengguna',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { senderId, chatId, pushName } = chatInfo;
    const mention = senderId;
    const defaultThumb = 'https://files.catbox.moe/siioy2.jpg';
    let thumbPp = defaultThumb;

    try {
      const data = JSON.parse(fs.readFileSync(gamePath));
      const users = data?.tca?.user || {};
      const nama = Object.keys(users).find(k => users[k].id === senderId);

      if (!nama) {
        return conn.sendMessage(chatId, {
          text: `Kamu belum mempunyai akun game!\nKetik *.create <nama>* untuk membuat akun.`
        }, { quoted: msg });
      }

      const u = users[nama];
      const inv = u.inv || {};

      const formatInv = (obj, prefix = '') => {
        return Object.entries(obj).reduce((out, [k, v]) => {
          if (v == null) return out;
          if (typeof v === 'object' && !Array.isArray(v)) {
            const inner = formatInv(v, `${prefix}${k}.`);
            return inner ? out + inner : out;
          }
          return out + `• ${prefix}${k} x${v}\n`;
        }, '');
      };

      const invText = Object.keys(inv).length ? formatInv(inv).trim() : '(kosong)';

      intDB();
      const db = getDB();
      const d = Object.values(db.Private).find(v => v.Nomor === senderId);
      const uang = d?.money?.amount || 0;

      try {
        thumbPp = await conn.profilePictureUrl(senderId, 'image');
      } catch {}

      const teks =
        `${head}${Obrack} Akun Game ${Cbrack}\n` +
        `${side} ${btn} *Nama:* ${nama}\n` +
        `${side} ${btn} *Level:* ${u.lvl || 1}\n${side}\n` +
        `${side} ${btn} *Hasil Maining:* ${u.maining || '0x hasil'}\n` +
        `${side} ${btn} *Uang:* Rp${uang.toLocaleString('id-ID')}\n` +
        `${foot}${garis}\n\n` +
        `Inventory: ${readmore}\n${invText}`;

      await conn.sendMessage(chatId, {
        text: teks,
        mentions: [mention],
        contextInfo: {
          externalAdReply: {
            title: "Game Profile",
            body: `Akun game milik ${pushName}`,
            thumbnailUrl: thumbPp,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
          mentionedJid: [mention],
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: idCh
          }
        }
      }, { quoted: msg });

    } catch (e) {
      console.error('Error plugin usergame:', e);
      conn.sendMessage(chatId, {
        text: 'Terjadi kesalahan saat membaca akun game!'
      }, { quoted: msg });
    }
  }
};