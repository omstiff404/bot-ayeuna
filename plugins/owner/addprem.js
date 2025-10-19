module.exports = {
  name: 'addisPrem',
  command: ['addprem'],
  tags: 'Owner Menu',
  desc: 'Menambahkan pengguna ke status isPremium.',
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

    if (args.length < 2) {
      return conn.sendMessage(chatId, {
        text: `Gunakan format:\n${prefix}${commandText} @tag 7h\natau\n${prefix}${commandText} 628xxxx 7h`
      }, { quoted: msg });
    }

    intDB();
    const db = getDB();

    let targetNumber = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!targetNumber) {
      const raw = args[0].replace(/[^0-9]/g, '');
      if (!raw) return conn.sendMessage(chatId, { text: 'Nomor tidak valid' }, { quoted: msg });
      targetNumber = raw + '@s.whatsapp.net';
    }

    const match = args[1].match(/^(\d+)([hmd])$/);
    if (!match) {
      return conn.sendMessage(chatId, {
        text: 'Format durasi salah. Contoh: 7h (jam), 1d (hari), 30m (menit)'
      }, { quoted: msg });
    }

    const [_, valueStr, unit] = match;
    const value = parseInt(valueStr);
    const durationMs = unit === 'h' ? value * 3600000 :
                       unit === 'd' ? value * 86400000 :
                       unit === 'm' ? value * 60000 : null;

    if (!durationMs) {
      return conn.sendMessage(chatId, { text: 'Satuan waktu tidak dikenal' }, { quoted: msg });
    }

    const userKey = Object.keys(db.Private).find(k => db.Private[k].Nomor === targetNumber);
    if (!userKey) {
      return conn.sendMessage(chatId, { text: 'Pengguna tidak ditemukan di database' }, { quoted: msg });
    }

    db.Private[userKey].isPremium = {
      isPrem: true,
      time: durationMs,
      activatedAt: Date.now()
    };

    saveDB(db);

    const satuan = unit === 'h' ? 'jam' : unit === 'd' ? 'hari' : 'menit';
    conn.sendMessage(chatId, {
      text: `${userKey} (${targetNumber}) sekarang Premium selama ${value} ${satuan}`
    }, { quoted: msg });
  }
};