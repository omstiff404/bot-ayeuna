module.exports = {
  name: 'demote',
  command: ['demote', 'stopadmin', 'demoteadmin'],
  tags: 'Group Menu',
  desc: 'Turunkan admin grup menjadi anggota',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    prefix
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya Layla untuk grup.' }, { quoted: msg });

    const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);
    if (!userAdmin) return conn.sendMessage(chatId, { text: 'Kamu bukan admin.' }, { quoted: msg });
    if (!botAdmin) return conn.sendMessage(chatId, { text: 'Layla bukan admin.' }, { quoted: msg });

    const targetId = target(msg, senderId);
    if (!targetId || targetId === senderId.replace(/@s\.whatsapp\.net$/, '')) {
      return conn.sendMessage(chatId, {
        text: `Harap mention atau reply admin yang ingin diturunkan.\nContoh: ${prefix}demote @user`
      }, { quoted: msg });
    }

    const metadata = await mtData(chatId, conn);
    if (!metadata) return conn.sendMessage(chatId, { text: 'Gagal mengambil metadata grup.' }, { quoted: msg });

    const fullTargetId = `${targetId.replace(/\D/g, '')}@s.whatsapp.net`;
    const isTargetAdmin = metadata.participants.some(p =>
      p.id === fullTargetId && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    if (!isTargetAdmin) {
      return conn.sendMessage(chatId, {
        text: `@${targetId} bukan admin grup.`,
        mentions: [fullTargetId]
      }, { quoted: msg });
    }

    try {
      await conn.groupParticipantsUpdate(chatId, [fullTargetId], 'demote');
      if (!global.groupCache) global.groupCache = new Map();
      global.groupCache.delete(chatId);
      await mtData(chatId, conn);
    } catch (err) {
      console.error('Error saat demote:', err);
      conn.sendMessage(chatId, {
        text: 'Gagal menurunkan admin. Pastikan bot adalah admin dan ID valid.'
      }, { quoted: msg });
    }
  }
};