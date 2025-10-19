module.exports = {
  name: 'add',
  command: ['add', 'invite', 'tambahkan'],
  tags: 'Group Menu',
  desc: 'Menambahkan anggota ke grup',
  prefix: true,
  owner: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;
    if (!(await isPrem(module.exports, conn, msg))) return;
    let targetId = target(msg, senderId);
    const mentionTarget = targetId;
    if (!isGroup)
      return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya Laylaa bisa digunakan dalam grup!" });

    const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);

    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: msg });
    }

    if (!botAdmin) {
    return conn.sendMessage(chatId, { text: '❌ Layla bukan admin' }, { quoted: msg });
    }

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant;

    let targetUser = quotedSender;

    if (!targetUser && args[1]) {
      const number = args[1].replace(/[^0-9]/g, "");
      if (number.length < 8) {
        return conn.sendMessage(chatId, { text: "❌ Nomor tidak valid!" }, { quoted: msg });
      }
      targetUser = number + "@s.whatsapp.net";
    }

    if (!targetUser) {
      return conn.sendMessage(chatId, {
        text: `❌ Gunakan perintah ini dengan format:\n• Reply pesan target\n• ${prefix}${commandText} 628xxxxxxxxx`
      }, { quoted: msg });
    }

    const alreadyInGroup = groupMetadata.participants.some(p => p.id === targetUser);
    if (alreadyInGroup) {
      return conn.sendMessage(chatId, { text: "✅ Target sudah berada dalam grup." }, { quoted: msg });
    }

    await conn.groupParticipantsUpdate(chatId, [targetUser], "add")
      .then(() => conn.sendMessage(chatId, {
        text: `✅ Berhasil menambahkan @${mentionTarget}`,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: msg }))
      .catch(() => conn.sendMessage(chatId, {
        text: "❌ Gagal menambahkan anggota. Pastikan nomor aktif dan bot adalah admin!"
      }, { quoted: msg }));
  }
};