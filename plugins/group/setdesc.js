module.exports = {
  name: 'setdesc',
  command: ['setdesc', 'setdeskripsi'],
  tags: 'Group Menu',
  desc: 'Mengatur deskripsi group',
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
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg }, { quoted: msg });
    }

    const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);

    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: msg });
    }

    if (!botAdmin) {
    return conn.sendMessage(chatId, { text: '❌ Bot bukan admin' }, { quoted: msg });
    }

    const description = args.join(' ');
    if (!description) {
      return conn.sendMessage(chatId, { text: '⚠️ Harap masukkan deskripsi grup setelah perintah!' }, { quoted: msg }, { quoted: msg });
    }

    try {
      await conn.groupUpdateDescription(chatId, description);

      conn.sendMessage(chatId, { text: `✅ Deskripsi grup berhasil diperbarui menjadi:\n${description}` }, { quoted: msg }, { quoted: msg });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal memperbarui deskripsi grup.' }, { quoted: msg });
    }
  }
};