module.exports = {
  name: 'delisPrem',
  command: ['delprem', 'deleteisPremium'],
  tags: 'Owner Menu',
  desc: 'Menghapus status isPremium dari pengguna.',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (args.length < 1 && !ctx) {
      return conn.sendMessage(chatId, {
        text: `Gunakan format:\n\n*${prefix}${commandText} @tag*\n*${prefix}${commandText} 628xxxx*\n*balas pesan lalu ketik ${prefix}${commandText}*`
      }, { quoted: msg });
    }

    try {
      intDB();
      const db = getDB();

      let target = ctx?.mentionedJid?.[0] || ctx?.participant || null;

      if (!target && args.length >= 1) {
        const numArg = args.find(arg => /^\d{8,}$/.test(arg));
        if (numArg) target = numArg.replace(/\D/g, '') + '@s.whatsapp.net';
      }

      if (!target || !target.endsWith('@s.whatsapp.net')) {
        return conn.sendMessage(chatId, { text: 'Nomor tidak valid atau tidak ditemukan!' }, { quoted: msg });
      }

      target = target.toLowerCase().trim();
      const userKey = Object.keys(db.Private).find(k => (db.Private[k].Nomor || '').toLowerCase().trim() === target);

      if (!userKey) {
        return conn.sendMessage(chatId, { text: 'Pengguna tidak ditemukan di database!' }, { quoted: msg });
      }

      const user = db.Private[userKey];
      if (!user.isPremium?.isPrem) {
        return conn.sendMessage(chatId, {
          text: `Pengguna *${userKey}* tidak memiliki status Premium.`
        }, { quoted: msg });
      }

      user.isPremium.isPrem = false;
      user.isPremium.time = 0;

      saveDB(db);

      conn.sendMessage(chatId, {
        text: `Status Premium *${userKey}* (${target}) telah dihapus.`
      }, { quoted: msg });

    } catch (err) {
      console.error('Error delisPrem.js:', err);
      conn.sendMessage(chatId, {
        text: 'Terjadi kesalahan saat menghapus status Premium!'
      }, { quoted: msg });
    }
  },
};