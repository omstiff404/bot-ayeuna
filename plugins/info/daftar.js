module.exports = {
  name: 'daftar gc',
  command: ['daftargc'],
  tags: 'Info Menu',
  desc: 'Mendaftarkan pengguna atau grup.',
  prefix: true,
  whiteLiss: true,

  run: async (conn, msg, { chatInfo, prefix, commandText, args }) => {
    const { chatId, senderId, isGroup, pushName } = chatInfo;
    try {
      intDB();
      const db = getDB();
      db.Private ??= {};
      db.Grup ??= {};

      if (commandText === 'daftargc') {
        if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan di dalam grup.' }, { quoted: msg });

        const { subject: groupName } = await conn.groupMetadata(chatId);
        if (Object.values(db.Grup).some(g => g.Id === chatId)) {
          return conn.sendMessage(chatId, { text: 'Grup ini sudah terdaftar di database.' }, { quoted: msg });
        }

        db.Grup[groupName] = {
          Id: chatId,
          autoai: false,
          bell: false,
          mute: false,
          setWarn: 0,
          gbFilter: {
            Welcome: { welcome: false, welcomeText: '' },
            Left: { gcLeft: false, leftText: '' },
            link: { antilink: false, setlink: '' },
            stiker: { antistiker: false },
            antibot: false,
            antiTagSw: false
          },
          antibadword: { badword: false, badwordText: '' }
        };

        saveDB();
        return conn.sendMessage(chatId, { text: `Grup *${groupName}* berhasil didaftarkan ke dalam database.` }, { quoted: msg });
      }

      if (args.length < 2) {
        return conn.sendMessage(chatId, {
          text: `Cara daftar:\n\n*${prefix}daftar Layla Umur*\n\nContoh:\n*${prefix}daftar ${pushName} 20*`
        }, { quoted: msg });
      }

      const umur = parseInt(args.at(-1));
      const nama = args.slice(0, -1).join(' ');

      if (isNaN(umur) || umur > 100) {
        return conn.sendMessage(chatId, { text: 'Gunakan umur asli dan tidak boleh lebih dari 100.' }, { quoted: msg });
      }

      if (getUser(db, senderId)) {
        return conn.sendMessage(chatId, {
          text: `Nama *${nama}* sudah terdaftar.\nGunakan nama lain atau cek profil dengan *${prefix}profile*.`
        }, { quoted: msg });
      }

      const noId = [...Array(7)].map(() => 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.random() * 26 | 0)).join('') + (Math.floor(Math.random() * 100) + 1);

      db.Private[nama] = {
        Nomor: senderId,
        umur: umur.toString(),
        noId,
        autoai: false,
        bell: false,
        cmd: 0,
        claim: false,
        money: { amount: 300000 },
        isPremium: { isPrem: false, time: 0 },
        afk: {}
      };

      saveDB();

      const note = umur < 12 ? '\n\nKamu masih kecil, jadi sering-sering baca dan peka ya.' : '';

      conn.sendMessage(chatId, {
        text:
          `Pendaftaran berhasil!\n\n` +
          `Nama: *${nama}*\n` +
          `Umur: *${umur}*\n` +
          `ID: *${noId}*${note}\n\n` +
          `Ketik *${prefix}profile* untuk melihat profil.`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: msg });

    } catch (err) {
      console.error('Plugin daftar.js error:', err);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mendaftar.' }, { quoted: msg });
    }
  },
};