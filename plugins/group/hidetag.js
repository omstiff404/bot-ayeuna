module.exports = {
  name: 'hidetag',
  command: ['hidetag', 'h'],
  tags: 'Group Menu',
  desc: 'Tag semua anggota grup',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya Layla bisa digunakan dalam grup!' }, { quoted: msg });
    }

    const { userAdmin } = await stGrup(conn, chatId, senderId);

    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: msg });
    }

    const textToSend = args.join(' ');
    if (!textToSend) {
      return conn.sendMessage(chatId, {
        text: `⚠️ Harap masukkan teks yang ingin dikirim!\nContoh: ${prefix}${commandText} Pesan rahasia`
      }, { quoted: msg });
    }

    try {
      const groupMetadata = await mtData(chatId, conn);
      if (!groupMetadata) {
        return conn.sendMessage(chatId, { text: '❌ Gagal mengambil data grup.' }, { quoted: msg });
      }

      await conn.sendMessage(chatId, {
        text: textToSend,
        mentions: groupMetadata.participants.map(p => p.id)
      }, { quoted: msg });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mengirim pesan.' }, { quoted: msg });
    }
  }
};