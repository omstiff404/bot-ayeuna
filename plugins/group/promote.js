module.exports = {
  name: 'promote',
  command: ['promote', 'jadiadmin', 'promoteadmin'],
  tags: 'Group Menu',
  desc: 'Promosikan anggota menjadi admin grup',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya untuk grup!' }, { quoted: msg });

    const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);
    if (!userAdmin) return conn.sendMessage(chatId, { text: 'Kamu bukan admin!' }, { quoted: msg });
    if (!botAdmin) return conn.sendMessage(chatId, { text: 'Bot bukan admin!' }, { quoted: msg });

    const targetId = target(msg, senderId);
    if (!targetId || targetId === senderId.replace(/@s\.whatsapp\.net$/, '')) {
      return conn.sendMessage(chatId, {
        text: `Harap mention atau reply anggota yang ingin dipromosikan!\nContoh: ${prefix}${commandText} @user`
      }, { quoted: msg });
    }

    const metadata = await mtData(chatId, conn);
    if (!metadata) return conn.sendMessage(chatId, { text: 'Gagal mengambil metadata grup.' }, { quoted: msg });

    const fullTargetId = `${targetId.replace(/\D/g, '')}@s.whatsapp.net`;
    const isAlreadyAdmin = metadata.participants.some(p =>
      p.id === fullTargetId && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    if (isAlreadyAdmin) {
      return conn.sendMessage(chatId, {
        text: `@${targetId} sudah menjadi admin.`,
        mentions: [fullTargetId]
      }, { quoted: msg });
    }

    try {
      await conn.groupParticipantsUpdate(chatId, [fullTargetId], 'promote');
      if (!global.groupCache) global.groupCache = new Map();
      global.groupCache.delete(chatId);
      await mtData(chatId, conn);
    } catch (err) {
      console.error('Error saat promote:', err);
      conn.sendMessage(chatId, {
        text: 'Gagal mempromosikan anggota. Pastikan bot adalah admin dan ID valid.'
      }, { quoted: msg });
    }
  }
};