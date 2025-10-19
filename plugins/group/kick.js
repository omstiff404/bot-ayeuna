module.exports = {
  name: 'kick',
  command: ['kick', 'dor', 'tendang', 'keluar'],
  tags: 'Group Menu',
  desc: 'Mengeluarkan anggota dari grup.',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup)
      return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya Layla bisa digunakan dalam grup!" }, { quoted: msg });

    const { botAdmin, userAdmin, adminList } = await stGrup(conn, chatId, senderId);

    if (!userAdmin)
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: msg });

    if (!botAdmin)
      return conn.sendMessage(chatId, { text: '❌ Layla bukan admin!' }, { quoted: msg });

    const context = msg.message?.extendedTextMessage?.contextInfo || {};
    const targetUser = context.mentionedJid?.[0] || context.participant;

    if (!targetUser) {
      return conn.sendMessage(chatId, {
        text: `❌ Gunakan format:\n${prefix}${commandText} @628xxxx atau reply pesan target.`,
      }, { quoted: msg });
    }

    if (adminList.includes(targetUser)) {
      return conn.sendMessage(chatId, { text: "❌ Tidak bisa mengeluarkan admin grup!" }, { quoted: msg });
    }

    await conn.groupParticipantsUpdate(chatId, [targetUser], "remove")
      .catch(() => conn.sendMessage(chatId, {
        text: "❌ Gagal mengeluarkan anggota. Pastikan Layla adalah admin!"
      }, { quoted: msg }));
  }
};