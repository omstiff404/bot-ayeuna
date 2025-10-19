module.exports = {
  name: 'cek mesum',
  command: ['cekmesum'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa mesum orang',
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
      let targetId = target(msg, senderId);
      const mentionTarget = targetId;
      const persentase = Math.floor(Math.random() * 101);

      let komentar;
      if (persentase <= 25) {
        komentar = 'Masih mending';
      } else if (persentase <= 44) {
        komentar = 'Waduh ini sih udah';
      } else if (persentase <= 72) {
        komentar = 'Parah sih ini cabul luh';
      } else if (persentase <= 88) {
        komentar = 'Cabul bet Gilek😹😭';
      } else {
        komentar = 'Hati-hati orang cabul stress gilaa😹😹';
      }

      const teks = `*seberapa cabul* @${mentionTarget}\n\n*${persentase}%* Cabul\n_${komentar}_`

      await conn.sendMessage(chatId, {
        text: teks,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: msg });

    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(msg.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: msg,
      });
    }
  }
}