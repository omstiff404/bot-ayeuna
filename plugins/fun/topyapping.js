module.exports = {
  name: 'topyapping',
  command: ['topyapping', 'yapping'],
  tags: 'Fun Menu',
  desc: 'Tag 10 anggota grup secara acak sebagai yapping',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      const targetId = target(msg, senderId);
      const mentionTarget = targetId;

      if (!isGroup) {
        return await conn.sendMessage(chatId, {
          text: 'Perintah ini hanya bisa digunakan di grup.'
        }, { quoted: msg });
      }

      const metadata = await mtData(chatId, conn);
      if (!metadata) {
        return await conn.sendMessage(chatId, {
          text: 'Gagal mengambil metadata grup.'
        }, { quoted: msg });
      }

      const participants = metadata.participants
        .filter(p => !p.id.includes('g.us'))
        .map(p => p.id);

      if (participants.length < 1) {
        return await conn.sendMessage(chatId, {
          text: 'Tidak ada peserta untuk di-tag.'
        }, { quoted: msg });
      }

      const shuffled = participants.sort(() => 0.5 - Math.random());
      const topYapping = shuffled.slice(0, 10);

      let teks = `*Top besar Yapping di grup:*\n\n`;
      topYapping.forEach((id, i) => {
        const nomor = id.split('@')[0];
        teks += `${i + 1}. @${nomor}\n`;
      });

      await conn.sendMessage(chatId, {
        text: teks,
        mentions: topYapping
      }, { quoted: msg });

    } catch (e) {
      console.error('Error di plugin topyapping:', e);
      await conn.sendMessage(msg.chatId || msg.key.remoteJid, {
        text: 'Terjadi kesalahan saat menjalankan perintah.'
      }, { quoted: msg });
    }
  }
};