module.exports = {
  name: 'adduang',
  command: ['adduang'],
  tags: 'Owner Menu',
  desc: 'Menambahkan saldo ke pengguna.',
  prefix: true,
  owner: true,

  run: async (conn, msg, { chatInfo, prefix, commandText, args }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (args.length < 1 && !ctx) {
      return conn.sendMessage(chatId, {
        text: `Gunakan format:\n\n*${prefix}${commandText} @tag 10000*\n*${prefix}${commandText} 628xxxx 10000*\n*balas pesan lalu ketik ${prefix}${commandText} 10000*`
      }, { quoted: msg });
    }

    try {
      intDB();
      const db = getDB();
      let target = ctx?.mentionedJid?.[0] || ctx?.participant || null;
      let amount = parseInt(args.find(a => /^\d+$/.test(a)));

      if (!target && args.length >= 2) {
        const num = args.find(a => /^\d{8,}$/.test(a));
        const amt = args.find(a => /^\d{1,7}$/.test(a));
        if (num) target = num.replace(/\D/g, '') + '@s.whatsapp.net';
        if (amt) amount = parseInt(amt);
      }

      if (!target || !target.endsWith('@s.whatsapp.net')) {
        return conn.sendMessage(chatId, { text: 'Nomor tidak valid atau tidak ditemukan!' }, { quoted: msg });
      }

      if (!amount || isNaN(amount) || amount <= 0) {
        return conn.sendMessage(chatId, { text: 'Jumlah uang tidak valid! Contoh: 10000' }, { quoted: msg });
      }

      target = target.toLowerCase().trim();
      const userKey = Object.keys(db.Private).find(k => (db.Private[k].Nomor || '').toLowerCase().trim() === target);

      if (!userKey) {
        return conn.sendMessage(chatId, { text: 'Pengguna tidak ditemukan di database!' }, { quoted: msg });
      }

      const user = db.Private[userKey];
      user.money = user.money || {};
      user.money.amount = (user.money.amount || 0) + amount;

      saveDB(db);

      conn.sendMessage(chatId, {
        text: `Saldo Rp${amount.toLocaleString('id-ID')} berhasil ditambahkan ke *${userKey}* (${target}).`
      }, { quoted: msg });

    } catch (err) {
      console.error('Error adduang.js:', err);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menambahkan uang!' }, { quoted: msg });
    }
  },
};